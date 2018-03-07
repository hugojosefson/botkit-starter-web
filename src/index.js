import Botkit from 'botkit'
import web from './web'
import recastai from './recastai'
import skills from './skills/index'

const port = process.env.PORT || 8080

const botkitController = Botkit.socketbot({
  recastaiApiToken: process.env.RECASTAI_API_TOKEN,
  replyWithTyping: true
})

recastai(botkitController)
skills.forEach(skill => skill(botkitController))
botkitController.startTicking()

web({ port }).then(({ httpServer }) => {
  botkitController.openSocketServer(httpServer)
  console.log(`I AM ONLINE! COME TALK TO ME: http://localhost:${port}`)
})
