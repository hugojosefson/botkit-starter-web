import { promisify } from 'util'
import { DateTime } from 'luxon'
import {
  getDistributors,
  getDataProviderSkolmaten,
  filterDistributors,
  getMeals,
  extractOnlyMeals
} from '@hugojosefson/openmeal-api'
import haveAllVars from './have-all-vars'
import say from './say'

const debug = require('debug')('botkit:recastai-hears:whats-for-lunch')

export const startConvo = (bot, message) =>
  promisify(bot.startConversation.bind(bot))(message)

const doWhatWeCanAgain = (responseMessage, convo) => doWhatWeCan(convo)

export const doWhatWeCan = convo => {
  if (haveAllVars(convo)) {
    say(convo)

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
            debug(`Found ${distributors && distributors.length} distributors.`)
            if (distributors.length > 1) {
              convo.ask(
                `I found ${
                  distributors.length
                } schools with matching names: ${distributors
                  .map(
                    ({ name, address }) =>
                      `${name} in ${address.addressLocality}, ${
                        address.addressRegion
                      }`
                  )
                  .join('; ')}. Which one?`,
                doWhatWeCanAgain,
                {}
              )
              convo.next()
            } else {
              debug(`distributors: ${JSON.stringify(distributors, null, 2)}`)
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
                          `${meal.name} on ${datetime} in ${
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
    convo.ask(
      `I don't have all the info. What I do know, is: ${JSON.stringify(
        convo.vars,
        null,
        2
      )}`,
      doWhatWeCanAgain,
      {}
    )
    convo.next()
  }
}

export default controller => {
  // controller.hears(['whats-for-lunch'], 'message_received', (bot, message) => {
  //   startConvo(bot, message).then(convo => {
  //     populateVarsFromEntities(convo, message.entities)
  //     doWhatWeCan(convo)
  //   })
  // })
  // controller.hears(
  //   ['specify-location', 'specify-school', 'what-about-day'],
  //   'message_received',
  //   (bot, message) => {
  //     startConvo(bot, message).then(convo => {
  //       populateVarsFromEntities(convo, message.entities)
  //       doWhatWeCan(convo)
  //     })
  //   }
  // )
  // controller.hears(
  //   ['whats-for-lunch', 'specify-location', 'specify-school', 'what-about-day'],
  //   'message_received',
  //   (bot, message) => bot.reply(message, 'Got your message.')
  // )
}
