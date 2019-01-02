// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const {user, nID} = event
  try {
    let note = await db.collection('note').doc(nID).get()
    let openID = wxContext.OPENID
    let friends = note.friends
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
    if (result.updated == 1) {
      note.type = 2
      note.frients = []
      let newNID = await db.collection('note').add({
        data: note
      })
      return {
        code: -1,
        message: "加入成功",
        data: {
          id: newNID
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