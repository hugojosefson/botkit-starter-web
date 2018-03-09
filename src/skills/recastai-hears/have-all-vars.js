const REQUIRED_ENTITY_NAMES = ['location', 'school', 'datetime']

const haveVar = vars => entityName => !!vars[entityName]

const haveAllVars = convo => REQUIRED_ENTITY_NAMES.every(haveVar(convo.vars))

export default haveAllVars
