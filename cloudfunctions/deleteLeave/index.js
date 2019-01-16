// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "release-cff451"
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { lID } = event
  try {
    await db.collection('leave').doc(lID).update({
      // data 传入需要局部更新的数据
      data: {
        status: 9
      }
    })
    return {
      code: 0,
      message: "删除成功",
      data: null
    }
  } catch (e) {
    return {
      code: -1,
      message: e.message,
      data: null
    }
  }
}