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

  onLoad: function(e) {
    console.log("show", e)
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
  onShow: function(e) {
    if (wx.getStorageSync("refresh")) {
      wx.clearStorageSync("refresh")
      var that = this
      refreshDate(that)
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    var that = this
    refreshDate(that)
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this
    loadMore(that)
  },
  onShareAppMessage: function(res) {
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
  close: function(e) {
    console.log(e)
    closeNote(this, e.currentTarget.dataset.item._id)
  },
  share: function(e) {
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
  create: function() {
    wx.switchTab({
      url: '../add/index',
    })
  }
})

function getStatusClass(status) {
  switch (status) {
    case 1:
      return "header-wait"
    case 2:
      return "header-ing"
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
      return "进行中"
    case 3:
      return "已销假"
    case 9:
      return "已删除"
    default:
      return "未知状态"
  }
}

function closeNote(that, _id) {
  Toast.loading({
    mask: false,
    message: '正在销假...'
  });
  wx.cloud.callFunction({
    name: 'closeLeave',
    data: {
      lID: _id
    },
    success: res => {
      console.log(res)
      if (res.result.code == 0) {
        Toast.success("已销假")
        refreshDate(that)
      } else {
        Toast.fail(res.result.message)
      }
    },
    fail: err => {
      console.error('[云函数] [login] 调用失败', err)
      Toast.fail(err.message)
    }
  })
}

function addCreater(that, creater, nID) {
  Toast.loading({
    mask: false,
    message: '配置请假单...'
  });
  const db = wx.cloud.database()
  db.collection('leave').doc(nID).update({
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
  const _ = db.command
  db.collection('leave')
    .where({
      _openid: app.globalData.openID, // 填入当前用户 openid
      status: _.eq(1).or(_.eq(2)),
      type: 1
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
        notes: res.data.map(function(e) {
          e.showCreateTime = e.c_date.Format("yyyy年MM月dd日 hh点mm分")
          e.showStartTime = e.start_date.Format("yyyy年MM月dd日 hh点mm分")
          e.showEndTime = e.end_date.Format("yyyy年MM月dd日 hh点mm分")
          e.statusClass = getStatusClass(e.status)
          e.statusString = getStatusString(e.status)
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
  const _ = db.command
  console.log(curCount, new Date())
  db.collection('leave')
    .where({
      _openid: app.globalData.openID, // 填入当前用户 openid
      status: _.eq(1).or(_.eq(2)),
      type: 1
    })
    .limit(20) // 限制返回数量为 20 条
    .skip(curCount)
    .get()
    .then(res => {
      let hasMore = res.data.length >= 20
      let moreNotes = res.data.map(function(e) {
        e.showCreateTime = e.c_date.Format("yyyy年MM月dd日 hh点mm分")
        e.showStartTime = e.start_date.Format("yyyy年MM月dd日 hh点mm分")
        e.showEndTime = e.end_date.Format("yyyy年MM月dd日 hh点mm分")
        e.statusClass = getStatusClass(e.status)
        e.statusString = getStatusString(e.status)
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

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.Format = function (fmt) { //author: meizz 
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