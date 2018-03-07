import http from 'http'
import { promisify } from 'util'

const debug = require('debug')('botkit:web:server')

export default (app, { port }) => {
  const httpServer = http.createServer(app)

  const listen = promisify(httpServer.listen.bind(httpServer))
  const listenPromise = listen(port)

  return listenPromise
    .then(() => {
      debug(
        `Express webserver configured and listening at http://localhost:${port}`
      )
    })
    .then(() => ({ app, httpServer }))
}
