import { userList } from "../main.mjs"

const USER_DATA = [{
  "name": "111",
  "password": "111",
}, {
  "name": "222",
  "password": "222",
}]

const LOST_TIME = 5000

export default class User {
  username
  key = ''
  ws = undefined
  lastHeart = new Date().getTime()
  playerData = {}
  
  // 发送消息的法方 会这创建时被赋值
  send = (data) => {}

  constructor(username, password) {
    if (User.checkPassword(username, password) === false) {
      throw new Error('用户名或密码错误')
    }
    if (User.checkUserState(username) === false) {
      throw new Error('该用户已登录')
    }
    this.username = username
  }

  setKey(key) {
    this.key = key
  }
  
  updateHeart() {
    this.lastHeart = new Date().getTime()
  }

  checkLost() {
    const time = new Date().getTime()
    if (time - this.lastHeart > LOST_TIME) {
      return true
    }
    return false
  }

  // 已经登录的不允许登录
  static checkUserState(username) {
    if (userList.find(v => v.username === username)) {
      return false
    }
    return true
  }

  // 账号密码对的允许登录
  static checkPassword(username, password) {
    // if (USER_DATA.find(v => v.name === username && v.password === password)) {
    //   return true
    // }
    // return false
    return true
  }
}