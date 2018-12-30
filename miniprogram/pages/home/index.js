//index.js
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast';
const app = getApp()

Page({
  data: {
    notes: []
  },

  onLoad: function() {
    var that = this
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openID = res.result.openid
        const db = wx.cloud.database()
        console.log(app.globalData)
        db.collection('note')
          .where({
            _openid: app.globalData.openID, // 填入当前用户 openid
          })
          .limit(10) // 限制返回数量为 10 条
          .get()
          .then(res => {
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
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        Toast.error(err)
      }
    })
  },
  o: function (e) {
    console.log(app.globalData.openID)
  }
})

function getLocalTime(date) {
  return date.toLocaleString().replace(/:\d{1,2}$/, ' ');
}
