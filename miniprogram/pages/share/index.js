// miniprogram/pages/share/index.js
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    Toast.loading({
      mask: false,
      message: '获取数据...'
    });
    const db = wx.cloud.database()
    db.collection('note').doc(options.id).get()
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