import { promisify } from 'util'
import { DateTime } from 'luxon'
import {
  getDistributors,
  getDataProviderSkolmaten,
  filterDistributors,
  getMeals,
  extractOnlyMeals
} from '@hugojosefson/openmeal-api'

const debug = require('debug')('botkit:recastai-hears:whats-for-lunch')

const REQUIRED_ENTITY_NAMES = ['location', 'school', 'datetime']

const startConvo = (bot, message) =>
  promisify(bot.startConversation.bind(bot))(message)

const keepOnlyTheFirstOne = array => array[0]

const populateVarFromEntity = (convo, entities) => entityName => {
  const entity = entities[entityName]

  if (Array.isArray(entity) && entity.length) {
    convo.setVar(entityName, keepOnlyTheFirstOne(entity))
  }
}

const populateVarsFromEntities = (convo, entities) =>
  REQUIRED_ENTITY_NAMES.forEach(populateVarFromEntity(convo, entities))

const haveVar = vars => entityName => !!vars[entityName]

const haveAllVars = convo => REQUIRED_ENTITY_NAMES.every(haveVar(convo.vars))

const sayLocation = (convo, location = convo.vars.location) => {
  const { formatted, confidence } = location
  convo.say(
    `I'm ${100 *
      confidence} % certain you want to know what's for lunch in location ${formatted}.`
  )
}

const saySchool = (convo, school = convo.vars.school) => {
  const { value, confidence } = school
  convo.say(
    `I'm ${100 *
      confidence} % certain you want to know what's for lunch in school ${value}.`
  )
}

const sayDatetime = (convo, datetime = convo.vars.datetime) => {
  const { iso, confidence } = datetime
  convo.say(
    `I'm ${100 *
      confidence} % certain you want to know what's for lunch at ${iso}.`
  )
}

export default controller => {
  controller.hears(['whats-for-lunch'], 'message_received', (bot, message) => {
    startConvo(bot, message).then(convo => {
      populateVarsFromEntities(convo, message.entities)
      if (haveAllVars(convo)) {
        // sayLocation(convo)
        // saySchool(convo)
        // sayDatetime(convo)

        const datetime = DateTime.fromISO(convo.vars.datetime.iso).toFormat(
          'yyyy-MM-dd'
        )

        getDataProviderSkolmaten()
          .then(skolmaten => {
            debug('Found skolmaten')
            getDistributors(skolmaten)
              .then(distributors => {
                return filterDistributors({
                  distributors,
                  name: convo.vars.school.value,
                  address: convo.vars.location.raw
                })
              })
              .then(distributors => {
                debug(
                  `Found ${distributors && distributors.length} distributors.`
                )
                if (distributors.length > 1) {
                  convo.say(
                    `I found ${
                      distributors.length
                    } schools with matching names: ${distributors
                      .map(
                        ({ name, address }) =>
                          `${name} in ${address.addressLocality}, ${
                            address.addressRegion
                          }`
                      )
                      .join('; ')}. Which one?`
                  )
                  convo.next()
                } else {
                  debug(
                    `distributors: ${JSON.stringify(distributors, null, 2)}`
                  )
                  distributors.forEach(distributor => {
                    getMeals({
                      dataprovider: skolmaten,
                      distributor,
                      startDate: datetime,
                      endDate: datetime
                    })
                      .then(extractOnlyMeals)
                      .then(meals => {
                        debug(`meals: ${JSON.stringify(meals, null, 2)}`)
                        meals
                          .filter(meal => meal.courses && meal.courses.length)
                          .forEach(meal =>
                            convo.say(
                              `${meal.name} today in ${
                                distributor.name
                              } is ${meal.courses
                                .map(({ name }) => name)
                                .join('; ')}.`
                            )
                          )
                      })
                  })
                  convo.next()
                }
              })
          })
          .catch(e => {
            debug('There was an error: ' + JSON.stringify(e, null, 2))
            convo.say('There was an error: ' + JSON.stringify(e, null, 2))
          })
      } else {
        convo.say(`I don't have all the info.`)
        convo.say(`What I do know, is: ${JSON.stringify(convo.vars, null, 2)}`)
        convo.next()
      }
    })
  })
}
