import { DateTime } from 'luxon'
import {
  getDistributors,
  getDataProviderSkolmaten,
  filterDistributors,
  getMeals,
  extractOnlyMeals
} from '@hugojosefson/openmeal-api'

const debug = require('debug')('botkit:recastai_hears')

export default controller => {
  debug('Register "hears get-contact-info"')
  controller.hears(['get-contact-info'], 'message_received', (bot, message) => {
    debug('Heard get-contact-info')
    bot.reply(message, "You want contact info? I'll give you contact info!")
  })

  debug('Register "hears get-opening-hours"')
  controller.hears(
    ['get-opening-hours'],
    'message_received',
    (bot, message) => {
      debug('Heard get-opening-hours')
      bot.reply(
        message,
        "You want opening hours? I'll give you business hours!"
      )
    }
  )

  debug('Register "hears whats-for-lunch"')
  controller.hears(['whats-for-lunch'], 'message_received', (bot, message) => {
    debug('Heard whats-for-lunch')
    bot.reply(
      message,
      "You seem to want to know what's for lunch, but haven't told me where."
    )
  })

  debug('Register "hears whats-for-lunch-in-location"')
  controller.hears(
    ['whats-for-lunch-in-location'],
    'message_received',
    (bot, message) => {
      if (message.entities.location && message.entities.location.length) {
        message.entities.location.forEach(({ formatted, confidence, raw }) => {
          debug(
            `Heard whats-for-lunch-in-location, and I'm ${100 *
              confidence} % certain they mean ${formatted}.`
          )
          bot.reply(
            message,
            `I'm ${100 *
              confidence} % certain you want to know what's for lunch in ${formatted}.`
          )

          const today = DateTime.local().toFormat('yyyy-MM-dd')
          getDataProviderSkolmaten()
            .then(skolmaten => {
              getDistributors(skolmaten)
                .then(distributors =>
                  filterDistributors({
                    distributors,
                    address: raw
                  })
                )
                .then(distributors => {
                  if (distributors.length > 1) {
                    bot.reply(
                      message,
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
                  } else {
                    return distributors.forEach(distributor => {
                      debug(
                        `distributor: ${JSON.stringify(distributor, null, 2)}`
                      )
                      getMeals({
                        dataprovider: skolmaten,
                        distributor,
                        startDate: today,
                        endDate: today
                      })
                        .then(extractOnlyMeals)
                        .then(meals => {
                          meals
                            .filter(meal => meal.courses && meal.courses.length)
                            .forEach(meal =>
                              bot.reply(
                                message,
                                `${meal.name} today in ${
                                  distributor.name
                                } is ${meal.courses
                                  .map(({ name }) => name)
                                  .join('; ')}.`
                              )
                            )
                        })
                    })
                  }
                })
            })
            .catch(e => {
              debug('There was an error: ' + JSON.stringify(e, null, 2))
              bot.reply(
                message,
                'There was an error: ' + JSON.stringify(e, null, 2)
              )
            })
        })
      } else {
        debug('Heard whats-for-lunch-in-location, but no location detected.')
        bot.reply(
          message,
          "You seem to want to know what's for lunch in a specific place, but I could not understand where."
        )
      }
    }
  )
}
