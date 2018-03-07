import { DateTime } from 'luxon'
import {
  getDistributors,
  getDataProviderSkolmaten,
  filterDistributors,
  getMeals,
  extractOnlyMeals
} from '@hugojosefson/openmeal-api'

const debug = require('debug')('botkit:recastai-hears:whats-for-lunch')

export default controller => {
  controller.hears(['whats-for-lunch'], 'message_received', (bot, message) => {
    bot.reply(
      message,
      "You seem to want to know what's for lunch, but haven't told me where."
    )
  })

  controller.hears(
    ['whats-for-lunch-in-location'],
    'message_received',
    (bot, message) => {
      if (message.entities.location && message.entities.location.length) {
        message.entities.location.forEach(({ formatted, confidence, raw }) => {
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
