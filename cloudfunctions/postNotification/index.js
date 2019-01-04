// 云函数入口文件
const cloud = require('wx-server-sdk')
var request = require('request')

cloud.init()
const db = cloud.database()
const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
  let _timestamp = new Date().getTime()
  let currentMinute = _timestamp / 1000 / 60
  let currentMinuteDate = new Date(parseInt(currentMinute) * 1000 * 60)
  const wxContext = cloud.getWXContext()
  const _ = db.command
  let note = await db.collection('access_token').doc("XC2OzlsqTi00tlHC").get()
  let access_token = note.data.access_token
  console.log(access_token)
  // 先取出集合记录总数
  const countResult = await db.collection('note').where({
    a_date: _.eq(currentMinuteDate),
    status: 1
  }).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  for (let i = 0; i < batchTimes; i++) {
    const result = await db.collection('note').where({
      a_date: _.eq(currentMinuteDate),
      status: 1
    }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()

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
            "value": note.a_date == null ? "未指定时间" : note.a_date.Format('yyyy年MM月dd日 hh:mm')
          },
          "keyword4": {
            "value": note.address.length == 0 ? "未指定地点" : note.address
          },
          "keyword5": {
            "value": note.weather.length == 0 ? "未获取天气" : note.weather
          },
          "keyword6": {
            "value": note.creater == {} ? "自己" : note.creater.nickName
          }
        },
        "emphasis_keyword": "keyword1.DATA"
      }
      console.log(body)
      await httprequest(url, JSON.stringify(body))
      await db.collection('note').doc(note._id).update({
        data: {
          status: 2
        }
      })
    }
  }
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
    "h+": this.getHours() + 8, //小时 
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

function getLocalTime(date) {
  return date.toLocaleString().replace(/\//g, '-');
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