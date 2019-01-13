// miniprogram/pages/add/index.js
var amapFile = require('../../libs/amap-wx.js');
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast';
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
var detail = ""

Page({

  /**
   * 页面的初始数据
   */
  data:{
    title: "",
    detail: "",
    address: "",
    weather: "",
    isUserScope: false, // 用户是否授权
    minDate: new Date().getTime(),
    showLeaveType: false,
    showStartDate: false,
    showEndDate: false,
    selStartDate: new Date().getTime(),
    startTime: "",
    endTime: "",
    titleAbled: false,
    selEndDate: new Date().getTime(),
    popupFix: false,
    leaves: [
      "迟到",
      "病假",
      "事假",
      "婚假",
      "丧假",
      "产假",
      "年休假"
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  onTypeFocus: function () {
    this.setData({
      showLeaveType: true,
      titleAbled: true
    })
  },

  onConfirmLeaveType: function (e) {
    console.log(e)
    this.setData({
      title: e.detail.value,
      showLeaveType: false
    })
  },

  onCancelLeaveType: function (e) {
    this.setData({
      showLeaveType: false
    })
  },

  onTimeStartFocus: function () {
    this.setData({
      showStartDate: true
    })
  },
  
  onConfirmStartTime: function(e) {
    let date = new Date(e.detail)
    this.setData({
      selStartDate: date,
      startTime: date.Format("yyyy年MM月dd日 hh点mm分"),
      showStartDate: false
    })
  },

  onCancelStartTime: function (e) {
    this.setData({
      showStartDate: false
    })
  },

  onTimeEndFocus: function () {
    this.setData({
      showEndDate: true
    })
  },

  onConfirmEndTime: function (e) {
    let date = new Date(e.detail)
    this.setData({
      selEndDate: date,
      endTime: date.Format("yyyy年MM月dd日 hh点mm分"),
      showEndDate: false
    })
  },

  onCancelEndTime: function (e) {
    this.setData({
      showEndDate: false
    })
  },

  readUserInfo: function (e) {
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
      // addCreater(that, e.detail.userInfo, e.currentTarget.dataset.item._id)
    }
  },

  onChangeAddress: function (event) {
    Toast.loading({
      mask: false,
      message: '获取位置...'
    });
    // 需要手动对 checked 状态进行更新
    var that = this
    // this.setData({ checked: event.detail });
    var myAmapFun = new amapFile.AMapWX({ key: 'ef26004f24e34015a0e3b64576c1731c' });
    myAmapFun.getRegeo({
      success: function (data) {
        Toast.clear()
        that.setData({
          address: data[0].regeocodeData.formatted_address
        })
      },
      fail: function (info) {
        Toast.clear()
        //失败回调
        console.log(info)
      }
    })
  },

  onChangeWeather: function (event) {
    Toast.loading({
      mask: false,
      message: '获取天气...'
    });
    var that = this;
    var myAmapFun = new amapFile.AMapWX({ key: 'ef26004f24e34015a0e3b64576c1731c' });
    myAmapFun.getWeather({
      success: function (data) {
        Toast.clear()
        console.log(data)
        that.setData({
          weather: data.weather.data + ' ' + data.winddirection.data + ' ' + data.temperature.data + '°C' + ' 湿度: ' + data.humidity.data
        })
      },
      fail: function (info) {
        Toast.clear()
        //失败回调
        console.log(info)
      }
    })
  },
  onCloseStartDate: function (event) {
    console.log(event)
    this.setData({
      showDate: false
    })
  },
  close: function (event) {
    console.log(event)
    this.setData({
      showDate: false
    })
  },
  confirm: function (e) {
    this.setData({
      showDate: false,
      selDate: e.detail,
      time: getLocalTime(e.detail)
    })
  },
  cancel: function (e) {
    this.setData({
      showDate: false
    })
  },
  onDetailChange: function (e) {
    detail = e.detail
  },
  formSubmit(e) {
    var that = this
    if (this.data.title.length == 0) {
      Toast.fail('请选择请假类型');
      return
    }
    if (detail.length == 0) {
      Toast.fail('请输入请假原因');
      return
    }
    if (this.data.startTime.length == 0 || this.data.endTime.length == 0) {
      Toast.fail('请选择请假时间');
      return
    }
    const db = wx.cloud.database()
    Toast.loading({
      mask: false,
      message: '创建中...'
    });

    db.collection('leave').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        title: that.data.title,
        detail: detail,
        c_date: new Date(),
        start_date: that.data.selStartDate,
        end_date: that.data.selEndDate,
        address: that.data.address,
        weather: that.data.weather,
        form_id: e.detail.formId,
        status: 1, // 刚创建
        type: 1 // 我请的假
      }
    })
      .then(res => {
        Toast.clear()
        wx.setStorageSync("refresh", true)
        wx.switchTab({
          url: '../home/index',
        })
      })
      .catch(err => {
        Toast.fail(err.message)
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
    this.setData({
      minDate: new Date().getTime(),
      currentDate: new Date().getTime(),
      popupFix: false
    })
    var that = this
    setTimeout(function () {
      that.setData({
        popupFix: true
      })
    }, 100)
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

// function addCreater(that, creater, nID) {
  // const db = wx.cloud.database()
  // db.collection('leave').doc(nID).update({
 // //   data 传入需要局部更新的数据
    // data: {
      // creater: creater
    // }
  // })
    // .then(res => {
    // })
    // .catch(err => {
      // Toast.fail(err.message)
    // })
// }
// 
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