import captureMiddleware from './capture-middleware'

export default controller =>
  controller.middleware.capture.use(captureMiddleware)
