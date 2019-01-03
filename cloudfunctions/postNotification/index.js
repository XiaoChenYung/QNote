// 云函数入口文件
const cloud = require('wx-server-sdk')
var request = require('request')

cloud.init()
const db = cloud.database()
const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const _ = db.command
  let note = await db.collection('access_token').doc("XC2OzlsqTi00tlHC").get()
  let access_token = note.data.access_token
  console.log(access_token)
  // 先取出集合记录总数
  const countResult = await db.collection('note').where({
    a_date: _.neq(null)
  }).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  for (let i = 0; i < batchTimes; i++) {
    const result = await db.collection('note').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()

    for (let j = 0; j < result.data.length; j++) {
      let url = "https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=" + access_token
      console.log(typeof(url))
      let note = result.data[j]
      console.log(note)
      let body = {
        "access_token": access_token,
        "touser": note._openid,
        "template_id": "cRlzk1ENZeVAroA4ZNUCjdeybBbb82--_uzRoAhKrKE",
        "page": "/pages/home/index",
        "form_id": note.form_id,
        "data": {
          "keyword1": {
            "value": note.title
          },
          "keyword2": {
            "value": note.detail
          },
          "keyword3": {
            "value": note.a_date == null ? "未指定时间" : note.a_date
          },
          "keyword4": {
            "value": note.address.length == 0 ? "未指定地点" : note.address
          },
          "keyword5": {
            "value": note.weather.length == 0 ? "未获取天气" : note.weather
          },
          "keyword6": {
            "value": note.creater == null ? "自己" : note.creater.nickName
          }
        },
        "emphasis_keyword": "keyword1.DATA"
      }
      console.log(body)
      await httprequest(url, JSON.stringify(body))
    }
  }
}

function httprequest(url, requestData) {
  return new Promise((resolve, reject) => {
    console.log("url=", url)
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