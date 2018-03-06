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

const bot_options = {
  recastai_token: process.env.recastai_token,
  studio_token: process.env.studio_token,
  studio_command_uri: process.env.studio_command_uri,
  studio_stats_uri: process.env.studio_command_uri,
  replyWithTyping: true
}

// Create the Botkit controller, which controls all instances of the bot.
const controller = Botkit.socketbot(bot_options)

// Set up an Express-powered webserver to expose oauth and webhook endpoints
const webserver = require('./components/express_webserver')(controller)

// Load in a plugin that defines the bot's identity
require('./components/plugin_identity')(controller)

// enable advanced botkit studio metrics
// and capture the metrics API to use with the identity plugin!
controller.metrics = require('botkit-studio-metrics')(controller)

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

// This captures and evaluates any message sent to the bot as a DM
// or sent to the bot in the form "@bot message" and passes it to
// Botkit Studio to evaluate for trigger words and patterns.
// If a trigger is matched, the conversation will automatically fire!
// You can tie into the execution of the script using the functions
// controller.studio.before, controller.studio.after and controller.studio.validate
if (process.env.studio_token) {
  controller.on('message_received', function (bot, message) {
    controller.studio
      .runTrigger(bot, message.text, message.user, message.channel, message)
      .then(function (convo) {
        if (!convo) {
          // web bot requires a response of some kind!
          bot.reply(message, 'OK')

          // no trigger was matched
          // If you want your bot to respond to every message,
          // define a 'fallback' script in Botkit Studio
          // and uncomment the line below.
          // controller.studio.run(bot, 'fallback', message.user, message.channel, message);
        } else {
          // set variables here that are needed for EVERY script
          // use controller.studio.before('script') to set variables specific to a script
          convo.setVar('current_time', new Date())
          convo.setVar('bot', controller.studio_identity)
        }
      })
      .catch(function (err) {
        bot.reply(
          message,
          'I experienced an error with a request to Botkit Studio: ' + err
        )
        debug('Botkit Studio: ', err)
      })
  })
} else {
  console.log('~~~~~~~~~~')
  console.log('NOTE: Botkit Studio functionality has not been enabled')
  console.log(
    'To enable, pass in a studio_token parameter with a token from https://studio.botkit.ai/'
  )
}

function usage_tip () {
  console.log('~~~~~~~~~~')
  console.log('Botkit Starter Kit')
  console.log('Execute your bot application like this:')
  console.log('PORT=3000 studio_token=<MY BOTKIT STUDIO TOKEN> node bot.js')
  console.log('Get a Botkit Studio token here: https://studio.botkit.ai/')
  console.log('~~~~~~~~~~')
}
