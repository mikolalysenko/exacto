'use strict'

module.exports = generateCode

var compileBigInt = require('./lib/bigint-codegen')

//Future:  Use staged predicates:
//
//  Floating point filter -> Interval arithmetic -> Big int
//

function generateCode(ast, options) {
  options = options || {}
  return compileBigInt(ast, options)
}