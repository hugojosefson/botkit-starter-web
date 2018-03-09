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

export default (convo, vars = convo.vars) => {
  if (convo.vars.location) {
    sayLocation(convo)
  }
  if (convo.vars.school) {
    saySchool(convo)
  }
  if (convo.vars.datetime) {
    sayDatetime(convo)
  }
}
