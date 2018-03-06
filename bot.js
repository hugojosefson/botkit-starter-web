/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/

# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
const Botkit = require('botkit')
const debug = require('debug')('botkit:main')

const botOptions = {
  recastaiApiToken: process.env.RECASTAI_API_TOKEN,
  replyWithTyping: true
}

// Create the Botkit controller, which controls all instances of the bot.
const controller = Botkit.socketbot(botOptions)

// Set up an Express-powered webserver to expose oauth and webhook endpoints
const webserver = require('./components/express_webserver')(controller)

// Open the web socket server
controller.openSocketServer(controller.httpserver)

// Start the bot brain in motion!!
controller.startTicking()

const normalizedPath = require('path').join(__dirname, 'skills')
require('fs')
  .readdirSync(normalizedPath)
  .forEach(function (file) {
    require('./skills/' + file)(controller)
  })

console.log(
  'I AM ONLINE! COME TALK TO ME: http://localhost:' + (process.env.PORT || 8080)
)
