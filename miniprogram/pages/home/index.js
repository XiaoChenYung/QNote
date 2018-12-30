//index.js
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast';
const app = getApp()

Page({
  data: {
    notes: []
  },

  onLoad: function() {
    
  },
  onShow: function () {
    var that = this
    if(!app.globalData.openID) {
      // 调用云函数
      Toast.loading({
        mask: false,
        message: '登陆中...'
      });
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log('[云函数] [login] user openid: ', res.result.openid)
          app.globalData.openID = res.result.openid
          refreshDate(that)
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
          Toast.error(err)
        }
      })
    } else {
      refreshDate(that)
    }
  },
  close: function (e) {
    console.log(app.globalData.openID)
  },
  share: function (e) {
    console.log(app.globalData.openID)
  },
  create: function () {
    wx.switchTab({
      url: '../add/index',
    })
  }
})

function getLocalTime(date) {
  return date.toLocaleString().replace(/:\d{1,2}$/, ' ');
}

function refreshDate(that) {
  Toast.loading({
    mask: false,
    message: '获取数据...'
  });
  const db = wx.cloud.database()
  db.collection('note')
    .where({
      _openid: app.globalData.openID, // 填入当前用户 openid
    })
    .limit(10) // 限制返回数量为 10 条
    .get()
    .then(res => {
      Toast.clear()
      console.log(res.data)
      that.setData({
        notes: res.data.map(function (e) {
          if (e.a_date.getFullYear() > 2000) {
            e.showAlertTime = getLocalTime(e.a_date)
          } else {
            e.showAlertTime = ""
          }
          e.showCreateTime = getLocalTime(e.c_date)
          return e
        })
      })
    })
    .catch(err => {
      console.log(err.message)
      // Toast.error(err)
    })
}