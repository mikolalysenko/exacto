'use strict'

module.exports = runExacto

var parse = require('./parse')
var codegen = require('./codegen')

function runExacto(source, options) {
  return (new Function(codegen(parse(source), options)))()
}