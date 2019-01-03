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
  onLoad: function (options) {
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
  recept: function (e) {
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
  reject: function () {
    console.log('hhh')
    wx.switchTab({
      url: '/pages/home/index',
    })
  },
  formSubmit: function (e) {
    console.log(e)
    var that = this
    addShareUser(that, this.data.item._id, e.detail.formId)
  },
  closeAction: function () {
    this.setData({
      showActionSheet: false
    })
  },
  cancelAction: function () {
    this.setData({
      showActionSheet: false
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

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
  db.collection('note').doc(nID).get()
    .then(res => {
      Toast.clear()
      console.log(res.data)
      res.data.showCreateTime = getLocalTime(res.data.c_date)
      that.setData({
        item: res.data
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
    message: '加入便签...'
  });
  wx.cloud.callFunction({
    name: 'joinNote',
    data: {
      user: user,
      nID: nID,
      formID: formID
    },
    success: res => {
      Toast.clear()
      wx.switchTab({
        url: '../home/index',
      })
    },
    fail: err => {
      console.error('[云函数] [login] 调用失败', err)
      Toast.fail(err.message)
    }
  })
}