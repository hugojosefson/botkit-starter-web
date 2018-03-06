const debug = require('debug')('botkit:recastai_hears')

module.exports = controller => {
  debug('Register "hears get-contact-info"')
  controller.hears(['get-contact-info'], 'message_received', (bot, message) => {
    debug('Heard get-contact-info')
    bot.reply(message, "You want contact info? I'll give you contact info!")
  })

  debug('Register "hears get-opening-hours"')
  controller.hears(
    ['get-opening-hours'],
    'message_received',
    (bot, message) => {
      debug('Heard get-opening-hours')
      bot.reply(
        message,
        "You want opening hours? I'll give you business hours!"
      )
    }
  )
}
