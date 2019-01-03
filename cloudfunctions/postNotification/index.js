// 云函数入口文件
const cloud = require('wx-server-sdk')
var request = require('request')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}

function httprequest(url, requestData) {
  return new Promise((resolve, reject) => {
    var option = {
      url: url,
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: requestData
    }
    request(option, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(body)
      }
    });
  });
};