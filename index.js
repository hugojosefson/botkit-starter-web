if (!require('is-production')()) require('piping')()
require('engine-check')()
module.exports = require('@std/esm')(module)('./src/index.js').default
