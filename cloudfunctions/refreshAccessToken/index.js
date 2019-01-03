// 云函数入口文件
const cloud = require('wx-server-sdk')
var request = require('request')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let result = await httprequest(null)
  result = JSON.parse(result)
  console.log(result)
  console.log(result["access_token"])
  let updateResult = await db.collection('access_token').doc("XC2OzlsqTi00tlHC").update({
    data: {
      access_token: result["access_token"]
    }
  })
  console.log(updateResult)
}

function httprequest(requestData) {
  return new Promise((resolve, reject) => {
    var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx4f796b958e2e1253&secret=1fcc852a54dc454128bb9035d3836edb"
    var option = {
      url: url,
      method: "GET"
    }
    request(option, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(body)
      }
    });
  });
};