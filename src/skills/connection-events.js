import { doWhatWeCan, startConvo } from './recastai-hears/whats-for-lunch'

export default controller => {
  controller.on('hello', (bot, message) => {
    // a new session with an unknown user has begun
    bot.reply(message, 'Hi! You are new here.')

    startConvo(bot, message).then(convo => {
      doWhatWeCan(convo)
    })
  })

  controller.on('welcome_back', (bot, message) => {
    // a known user has started a new, fresh session. Or just reloaded their browser tab.
    bot.reply(message, 'Welcome back!')

    startConvo(bot, message).then(convo => {
      doWhatWeCan(convo)
    })
  })

  controller.on('reconnect', (bot, message) => {
    // the connection between the client and server experienced a disconnect/reconnect
    bot.reply(
      message,
      'Some sub-space interference just caused our connection to be interrupted. But I am back now.'
    )

    startConvo(bot, message).then(convo => {
      doWhatWeCan(convo)
    })
  })
}
