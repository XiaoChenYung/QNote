// miniprogram/pages/add/index.js
var amapFile = require('../../libs/amap-wx.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    message: "",
    title: "",
    address: "",
    weather: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  onChangeAddress: function (event) {
    // 需要手动对 checked 状态进行更新
    var that = this
    // this.setData({ checked: event.detail });
    var myAmapFun = new amapFile.AMapWX({ key: 'ef26004f24e34015a0e3b64576c1731c' });
    myAmapFun.getRegeo({
      success: function (data) {
        that.setData({
          address: data[0].regeocodeData.formatted_address
        })
      },
      fail: function (info) {
        //失败回调
        console.log(info)
      }
    })
  },

  onChangeWeather: function (event) {
    var that = this;
    var myAmapFun = new amapFile.AMapWX({ key: 'ef26004f24e34015a0e3b64576c1731c' });
    myAmapFun.getWeather({
      success: function (data) {
        console.log(data)
        that.setData({
          weather: data.weather.data + ' ' + data.winddirection.data + ' ' + data.temperature.data + '°C' + ' 湿度: ' + data.humidity.data
        })
      },
      fail: function (info) {
        //失败回调
        console.log(info)
      }
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