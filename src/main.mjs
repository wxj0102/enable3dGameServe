import expressWs from "express-ws";
import express from 'express'
import User from "./class/User.mjs";
import Game from './class/Game.mjs'
import { nanoid } from "nanoid";

const PORT = 5174

const app = express()
expressWs(app)

export const userList = []
export const gameList = []

app.ws('/ws', (ws, req) => {
  const send = (data) => {
    const strData = JSON.stringify(data)
    ws.send(strData)
  }
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg)
      switch (data.operation) {
        case 'heart': {
          // 心跳
          const key = data.key
          const user = userList.find(v => v.key === key)
          if (key && user) {
            user.updateHeart()
          }
          break;
        }
        case 'loginKey': {
          try {
            const key = data.key
            const user = userList.find(user => user.key === key)
            if (user) {
              user.send = send
              send({
                code: 0,
                operation: 'login',
                msg: '登录成功',
                from: 'key',
                key,
                nickname: user.username,
              })
            } else {
              send({
                code: 1,
                operation: 'login',
                msg: 'key错误',
                from: 'key',
              })
            }
          } catch (ex) {
            send({
              code: 1,
              operation: 'login',
              msg: 'key错误',
              from: 'key',
            })
          }
          break;
        }
        case 'login': {
          try {
            const key = nanoid()
            const user = new User(data.username, data.password)
            user.send = send
            user.setKey(key)
            userList.push(user)
            send({
              code: 0,
              operation: 'login',
              msg: '登录成功',
              key,
              from: 'input',
              nickname: user.username,
            })
          } catch (ex) {
            send({
              code: 1,
              operation: 'login',
              msg: '账号或密码错误',
              from: 'input',
            })
          }
          break;
        }
        case 'createGame': {
          const key = data.key
          const roomname = data.roomname
          const user = userList.find(v => v.key === key)
          if (user) {
            // 只有有用户的时候才可以创建
            // 先判断该玩家是否创建了房间
            if (gameList.find(v => v.onwer === user)) {
              send({
                operation: 'createGame',
                code: 1,
                msg: '不能重复创建房间',
              })
            } else {
              const id = nanoid()
              const game = new Game(id, user, roomname)
              gameList.push(game)
              game.onClose = () => {
                const index = gameList.findIndex(v => v === game)
                gameList.splice(index, 1)

                console.log('有游戏被关闭', gameList.length)
              }
              send({
                operation: 'createGame',
                code: 0,
                gameId: game.id
              })
            }
          }
          break;
        }
        case 'gameList': {
          const data = gameList.map(item => {
            return {
              id: item.id,
              roomname: item.name,
              onwer: item.onwer.username,
              count: item.count,
              maxCount: item.maxCount,
            }
          })
          send({
            operation: 'gameList',
            data: data,
          })
          break;
        }
        case 'joinGame': {
          const {
            key,
            gameId,
          } = data
          const game = gameList.find(v => v.id === gameId)
          const user = userList.find(v => v.key === key)
          if (game && user) {
            game.addPlayer(user)
          }
          break;
        }
        case 'game': {
          const gameId = data.gameId
          const game = gameList.find(v => v.id === gameId)
          if (game) {
            game.onMessage(data)
          }
          break
        }
      }
    } catch (ex) {
      console.log(ex)
    }
  })
})

// 启动服务器
app.listen(PORT, function () {
  console.log(`服务已启动 端口是 ${PORT}`);
});
