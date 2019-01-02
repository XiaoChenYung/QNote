// miniprogram/pages/add/index.js
var amapFile = require('../../libs/amap-wx.js');
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast';
var title = ""
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
    time: "",
    minHour: 10,
    maxHour: 20,
    minDate: new Date().getTime(),
    currentDate: new Date().getTime(),
    showDate: false,
    selDate: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  onChangeTime: function (event) {
    this.setData({
      showDate: true
    })
  },
  onClose: function (event) {
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
  onTitleChange: function (e) {
    title = e.detail
  },
  onDetailChange: function (e) {
    detail = e.detail
  },
  formSubmit(e) {
    console.log(e)
    console.log(e)
    var that = this
    if (title.length == 0 || detail.length == 0) {
      Toast.fail('请输入标题和详情');
      return
    }
    const db = wx.cloud.database()
    Toast.loading({
      mask: false,
      message: '创建中...'
    });

    db.collection('note').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        title: title,
        detail: detail,
        c_date: new Date(),
        a_date: new Date(that.data.selDate),
        address: that.data.address,
        weather: that.data.weather,
        form_id_id: e.detail.formId,
        status: 1,
        friends: []
      }
    })
      .then(res => {
        Toast.clear()
        that.setData({
          title: "",
          detail: "",
          address: "",
          weather: "",
          time: "",
          minHour: 10,
          maxHour: 20,
          minDate: new Date().getTime(),
          currentDate: new Date().getTime(),
          showDate: false,
          selDate: 0
        })
        wx.switchTab({
          url: '../home/index',
        })
      })
      .catch(console.error)
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

function getLocalTime(nS) {
  return new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/, ' ');
}