import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'

import registerWithRecastai from './registerWithRecastai'

import debug0 from 'debug'
const debug = debug0('botkit:webserver')

export default controller => {
  const webserver = express()
  webserver.use(bodyParser.json())
  webserver.use(bodyParser.urlencoded({ extended: true }))

  registerWithRecastai(controller)
  webserver.use(express.static('public'))

  const server = http.createServer(webserver)

  server.listen(process.env.PORT || 8080, null, function () {
    debug(
      'Express webserver configured and listening at http://localhost:' +
        process.env.PORT || 8080
    )
  })

  controller.webserver = webserver
  controller.httpserver = server

  return webserver
}
