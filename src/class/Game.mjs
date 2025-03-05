const TIME_STEP = 50

export default class Game {
  id
  onwer
  name
  count = 0
  maxCount = 8
  userList = []
  interval

  constructor(id, onwer, name) {
    this.id = id
    this.onwer = onwer
    this.name = name

    this.init()
  }

  init() {
    this.interval = setInterval(() => {
      const playerData = {}
      this.userList.forEach(user => {
        playerData[user.key] = user.playerData
      })
      this.checkUser()
      this.userList.forEach(user => {
        // 先检测是否有玩家掉线 如果没有掉线再发送位置

        user.send({
          operation: 'getPlayerData',
          playerData: playerData,
        })
      })
    }, TIME_STEP)
  }

  addPlayer(user) {
    if (this.userList.indexOf(user) === -1) {
      this.userList.push(user)
    }
  }

  checkUser() {
    let lostRoomOnwer = false
    this.userList.forEach((user, index) => {
      if (user.checkLost()) {
        user.playerData = {}
        this.userList.splice(index, 1)
        if (this.onwer === user) {
          lostRoomOnwer = true
        }
      }
    })

    if (lostRoomOnwer) {
      this.changeOnwer()
    }
    this.count = this.userList.length
  }

  changeOnwer() {
    if (this.userList.length) {
      this.onwer = this.userList[0]
    } else {
      // 解散游戏
      this.onClose()
    }
  }

  onMessage(data) {
    const key = data.key
    if (data.gameOperation === 'kill') {
      const targetKey = data.targetKey
      const user = this.userList.find(v => v.key === key)
      const target = this.userList.find(v => v.key === targetKey)
      this.onKill(user, target)
    } else if (data.gameOperation === 'reGame') {
      const user = this.userList.find(v => v.key === key)
      this.onReGame(user)
    } else {
      const position = data.position
      const quaternion = data.quaternion
      const animation = data.animation
      const user = this.userList.find(v => v.key === key)
      if (user) {
        user.playerData = {
          ...user.playerData,
          position,
          quaternion,
          animation,
        }
      }
    }
  }

  onKill(user, target) {
    target.playerData.state = 'dead'
  }

  onReGame (user) {
    console.log(user.username, '重新开始')
    user.playerData.state = undefined
  }

  onClose() {

  }
}