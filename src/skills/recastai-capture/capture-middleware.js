const debug = require('debug')('botkit:recastai-capture')

const keepOnlyTheFirstOne = array => array[0]

const populateVarFromEntity = (convo, entities) => entityName => {
  if (!entities) return

  const entity = entities[entityName]

  if (Array.isArray(entity) && entity.length) {
    convo.setVar(entityName, keepOnlyTheFirstOne(entity))
  } else if (entity && !Array.isArray(entity)) {
    convo.setVar(entityName, entity)
  }
}

export default (bot, message, convo, next) => {
  debug(
    `capturing message.entities = ${JSON.stringify(message.entities, null, 2)}`
  )
  if (message.entities) {
    const populate = populateVarFromEntity(convo, message.entities)

    Object.keys(message.entities).forEach(populate)
    debug(`captured convo.vars = ${JSON.stringify(convo.vars, null, 2)}`)
  }

  next()
}
