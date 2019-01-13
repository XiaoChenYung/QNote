// miniprogram/pages/share/index.js
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast';
const app = getApp()
var user = {}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: null,
    showActionSheet: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    if (!app.globalData.openID) {
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
          refreshData(that, options.id)
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
          Toast.fail(err)
        }
      })
    } else {
      refreshData(that, options.id)
    }
  },
  recept: function(e) {
    console.log(e)
    var that = this
    if (!e.detail.userInfo) {
      Dialog.alert({
        title: '提示',
        message: '分享内容需要获取用户昵称，头像等公开信息，您可以在小程序设置里重新授权'
      }).then(() => {
        // on close
      });
    } else {
      user = e.detail.userInfo
      this.setData({
        showActionSheet: true
      })
    }
  },
  reject: function() {
    console.log('hhh')
    wx.switchTab({
      url: '/pages/home/index',
    })
  },
  formSubmit: function(e) {
    console.log(e)
    var that = this
    addShareUser(that, this.data.item._id, e.detail.formId)
  },
  closeAction: function() {
    this.setData({
      showActionSheet: false
    })
  },
  cancelAction: function() {
    this.setData({
      showActionSheet: false
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})

function getLocalTime(date) {
  return date.toLocaleString().replace(/:\d{1,2}$/, ' ');
}

function refreshData(that, nID) {
  Toast.loading({
    mask: false,
    message: '获取数据...'
  });
  const db = wx.cloud.database()
  db.collection('leave').doc(nID).get()
    .then(res => {
      Toast.clear()
      let e = res.data
      e.showCreateTime = e.c_date.Format("MM月dd日 hh点mm分")
      e.showStartTime = e.start_date.Format("yyyy年MM月dd日 hh点mm分")
      e.showEndTime = e.end_date.Format("yyyy年MM月dd日 hh点mm分")
      e.statusClass = getStatusClass(e.status)
      e.statusString = getStatusString(e.status)
      that.setData({
        item: e
      })
    })
    .catch(err => {
      Toast.fail(err.message)
    })
}

function addShareUser(that, nID, formID) {
  that.setData({
    showActionSheet: false
  })
  Toast.loading({
    mask: false,
    message: '批准请假...'
  });
  wx.cloud.callFunction({
    name: 'joinNote',
    data: {
      user: user,
      nID: nID,
      formID: formID
    },
    success: res => {
      console.log(res)
      if (res.result.code == 0) {
        Toast.clear()
        wx.switchTab({
          url: '../home/index',
        })
      } else {
        Toast.fail(res.result.message)
        setTimeout(function() {
          wx.switchTab({
            url: '../home/index',
          })
        }, 1000)
      }
    },
    fail: err => {
      console.error('[云函数] [login] 调用失败', err)
      Toast.fail(err.message)
    }
  })
}

function getStatusClass(status) {
  switch (status) {
    case 1:
      return "header-ing"
    case 2:
      return "header-done"
    case 3:
      return "header-done"
    default:
      return "header-done"
  }
}

function getStatusString(status) {
  switch (status) {
    case 1:
      return "待批准"
    case 2:
      return "已批准"
    case 3:
      return "已销假"
    case 9:
      return "已删除"
    default:
      return "未知状态"
  }
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.Format = function(fmt) { //author: meizz 
  var o = {
    "M+": this.getMonth() + 1, //月份 
    "d+": this.getDate(), //日 
    "h+": this.getHours(), //小时 
    "m+": this.getMinutes(), //分 
    "s+": this.getSeconds(), //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3),
    "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}