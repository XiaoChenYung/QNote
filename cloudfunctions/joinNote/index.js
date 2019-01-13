// 云函数入口文件
const cloud = require('wx-server-sdk')
var request = require('request')

cloud.init({
  env: "release-cff451"
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const {user, nID, formID} = event
  try {
    await db.collection('leave').doc(nID).update({
      // data 传入需要局部更新的数据
      data: {
        approver: user,
        status: 2
      }
    })
    let noteData = await db.collection('leave').doc(nID).get()
    let note = noteData.data
    let openID = wxContext.OPENID
    note.approver_open_id = openID
    let oriFormID = note.form_id
    note.form_id = formID
    note.type = 2
    delete note._id
    let newNID = await db.collection('leave').add({
      data: note
    })
    let accessData = await db.collection('access_token').doc("XC9q83kPDdDCJ3FB").get()
    let access_token = accessData.data.access_token
    let url =  "https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=" + access_token
    let body = {
      "access_token": access_token,
      "touser": note._openid,
      "template_id": "kjIjo1Eb3mPerBBsIDExwRNq2nWt4fbrHvYKTN0DBjU",
      "page": "/pages/home/index",
      "form_id": oriFormID,
      "data": {
        "keyword1": {
          "value": note.title
        },
        "keyword2": {
          "value": "通过"
        },
        "keyword3": {
          "value": note.detail
        },
        "keyword4": {
          "value": note.c_date.Format("yyyy年MM月dd日 hh时mm分")
        },
        "keyword5": {
          "value": note.creater.nickName
        },
        "keyword6": {
          "value": note.start_date.Format("yyyy年MM月dd日 hh时mm分")
        },
        "keyword7": {
          "value": note.end_date.Format("yyyy年MM月dd日 hh时mm分")
        },
        "keyword8": {
          "value": user.nickName
        }
      },
      "emphasis_keyword": "keyword1.DATA"
    }
    await httprequest(url, JSON.stringify(body))
    return {
      code: 0,
      message: "加入成功",
      data: note
    }
  } catch (e) {
    return {
      code: -1,
      message: e.message,
      data: null
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