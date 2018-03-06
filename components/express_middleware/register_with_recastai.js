const debug = require('debug')('botkit:register_with_recastai')

module.exports = (webserver, controller) => {
  debug('Setting up middleware')
  const RecastaiMiddleware = require('botkit-middleware-recastai')({
    request_token: controller.config.recastaiApiToken,
    confidence: 0.4
  })

  debug('Using middleware')
  controller.middleware.receive.use(RecastaiMiddleware.receive)

  debug('Change ears')
  controller.changeEars(RecastaiMiddleware.hears)
}
