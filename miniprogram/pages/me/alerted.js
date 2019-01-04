//index.js
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast';
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
const app = getApp()
var shareItem = null
var curCount = 0

Page({
  data: {
    notes: [],
    showActionSheet: false,
    hasMore: true
  },

  onLoad: function () {
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
          refreshDate(that)
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
          Toast.fail(err)
        }
      })
    } else {
      refreshDate(that)
    }
  },
  onShow: function () {

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this
    refreshDate(that)
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    loadMore(that)
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(shareItem)
      this.setData({
        showActionSheet: false
      })
    }
    return {
      title: shareItem.title,
      path: '/pages/share/index?id=' + shareItem._id
    }
  },
  close: function (e) {
    console.log(e)
    closeNote(this, e.currentTarget.dataset.item._id)
  },
  share: function (e) {
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
      shareItem = e.currentTarget.dataset.item
      addCreater(that, e.detail.userInfo, e.currentTarget.dataset.item._id)
    }
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
  create: function () {
    wx.switchTab({
      url: '../add/index',
    })
  }
})

function getLocalTime(date) {
  return date.toLocaleString().replace(/:\d{1,2}$/, ' ');
}

function getStatusClass(status) {
  switch (status) {
    case 1:
      return "header-ing"
    case 9:
      return "header-done"
    default:
      return "header-done"
  }
}

function closeNote(that, _id) {
  Toast.loading({
    mask: false,
    message: '正在关闭...'
  });
  const db = wx.cloud.database()
  db.collection('note').doc(_id).update({
    // data 传入需要局部更新的数据
    data: {
      status: 3
    }
  })
    .then(res => {
      refreshDate(that)
    })
    .catch(err => {
      Toast.fail(err.message)
    })
}

function addCreater(that, creater, nID) {
  Toast.loading({
    mask: false,
    message: '配置分享...'
  });
  const db = wx.cloud.database()
  db.collection('note').doc(nID).update({
    // data 传入需要局部更新的数据
    data: {
      creater: creater
    }
  })
    .then(res => {
      Toast.clear()
      that.setData({
        showActionSheet: true
      })
    })
    .catch(err => {
      console.log(err)
      Toast.fail(err.message)
    })
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
      status: 2
    })
    .limit(20) // 限制返回数量为 20 条
    .get()
    .then(res => {
      Toast.clear()
      wx.stopPullDownRefresh()
      console.log(res.data)
      let hasMore = res.data.length >= 20
      curCount = res.data.length
      that.setData({
        hasMore: hasMore,
        notes: res.data.map(function (e) {
          if (e.a_date) {
            e.showAlertTime = getLocalTime(e.a_date)
          } else {
            e.showAlertTime = ""
          }
          e.showCreateTime = getLocalTime(e.c_date)
          e.statusClass = getStatusClass(e.status)
          return e
        })
      })
    })
    .catch(err => {
      wx.stopPullDownRefresh()
      console.log(err.message)
      Toast.fail(err.message)
    })
}

function loadMore(that) {
  Toast.loading({
    mask: false,
    message: '获取数据...'
  });
  const db = wx.cloud.database()
  console.log(curCount, new Date())
  db.collection('note')
    .where({
      _openid: app.globalData.openID, // 填入当前用户 openid
      status: 2
    })
    .limit(20) // 限制返回数量为 20 条
    .skip(curCount)
    .get()
    .then(res => {
      console.log("数据回来了", res.data, new Date())
      let hasMore = res.data.length >= 20
      let moreNotes = res.data.map(function (e) {
        if (e.a_date) {
          e.showAlertTime = getLocalTime(e.a_date)
        } else {
          e.showAlertTime = ""
        }
        e.showCreateTime = getLocalTime(e.c_date)
        e.statusClass = getStatusClass(e.status)
        return e
      })
      let notes = that.data.notes.concat(moreNotes)
      curCount = notes.length
      that.setData({
        hasMore: hasMore,
        notes: notes
      })
      Toast.clear()
    })
    .catch(err => {
      console.log(err.message)
      Toast.fail(err.message)
    })
}