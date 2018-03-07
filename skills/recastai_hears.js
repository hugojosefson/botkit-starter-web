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

  debug('Register "hears whats-for-lunch"')
  controller.hears(['whats-for-lunch'], 'message_received', (bot, message) => {
    debug('Heard whats-for-lunch')
    bot.reply(
      message,
      "You seem to want to know what's for lunch, but haven't told me where."
    )
  })

  debug('Register "hears whats-for-lunch-in-location"')
  controller.hears(
    ['whats-for-lunch-in-location'],
    'message_received',
    (bot, message) => {
      if (message.entities.location && message.entities.location.length) {
        message.entities.location.forEach(({ formatted, confidence }) => {
          debug(
            `Heard whats-for-lunch-in-location, and I'm ${100 *
              confidence} % certain they mean ${formatted}.`
          )
          bot.reply(
            message,
            `I'm ${100 *
              confidence} % certain you want to know what's for lunch in ${formatted}.`
          )
        })
      } else {
        debug('Heard whats-for-lunch-in-location, but no location detected.')
        bot.reply(
          message,
          "You seem to want to know what's for lunch in a specific place, but I could not understand where."
        )
      }
    }
  )
}
