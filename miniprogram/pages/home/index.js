//index.js
const app = getApp()

Page({
  data: {
    data: [
      {
        "title": "新建事项"
      }
    ]
  },

  onLoad: function() {
    
  },
  o: function (e) {
    console.log(app.globalData.openID)
  }
})
