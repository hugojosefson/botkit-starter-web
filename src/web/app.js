import express from 'express'
import bodyParser from 'body-parser'

export default () => {
  const expressApp = express()

  expressApp.use(bodyParser.json())
  expressApp.use(bodyParser.urlencoded({ extended: true }))
  expressApp.use(express.static('public'))

  return expressApp
}
