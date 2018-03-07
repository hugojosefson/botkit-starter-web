import BotkitMiddlewareRecastai from 'botkit-middleware-recastai'
import debug0 from 'debug'
const debug = debug0('botkit:register_with_recastai')

export default controller => {
  debug('Setting up middleware')
  const RecastaiMiddleware = BotkitMiddlewareRecastai({
    request_token: controller.config.recastaiApiToken,
    confidence: 0.4
  })

  debug('Using middleware')
  controller.middleware.receive.use(RecastaiMiddleware.receive)

  debug('Change ears')
  controller.changeEars(RecastaiMiddleware.hears)
}
