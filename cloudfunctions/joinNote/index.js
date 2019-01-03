// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const {user, nID, formID} = event
  try {
    let note = await db.collection('note').doc(nID).get()
    let openID = wxContext.OPENID
    let friends = note.data.friends
    let temp = 0
    for(var i = 0; i < friends.length; i++) {
      if(friends[i].open_id == openID) {
        break
      }
      temp ++;
    }
    if (friends.length == 0 || temp == friends.length) {
      user.open_id = openID
      friends.push(user)
    }
    let result = await db.collection('note').doc(nID).update({
      data: {
        friends: friends
      }
    })
    if (result.stats.updated == 1) {
      let newNID = await db.collection('note').add({
        data: {
          title: note.data.title,
          detail: note.data.detail,
          c_date: note.data.c_date,
          a_date: note.data.a_date,
          address: note.data.address,
          weather: note.data.weather,
          form_id: formId,
          status: 1, // 进行中
          type: 2, // 自己创建的
          friends: []
        }
      })
      return {
        code: 0,
        message: "加入成功",
        data: {
          id: newNID.data
        }
      }
    } else {
      return {
        code: -1,
        message: "数据库操作失败",
        data: null
      }
    }
  } catch (e) {
    return {
      code: -1,
      message: e.message,
      data: null
    }
  }
}