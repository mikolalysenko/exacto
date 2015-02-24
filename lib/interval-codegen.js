'use strict'

module.exports = generateCode

var round = require('./rounding')

function Variable(id, type) {
  this.id     = id
  this.type   = type
}

function Program(options, fallback) {
  this.args        = []
  this.identifiers = []
  this.variables   = []
  this.temporary   = []
  this.code        = []
  this.traceSteps  = !!options.trace
  this.name        = options.name || 'predicate'
  this.fallback    = fallback
}

var proto = Program.prototype

proto.getVariable = function(id) {
  for(var i=0; i<this.variables.length; ++i) {
    if(this.variables[i].id === id) {
      return this.variables[i]
    }
  }
  return null
}

proto.addVariable = function(id) {
  this.identifiers.push(
    id + '_lo',
    id + '_hi')
  var result = new Variable(id, 'interval')
  this.variables.push(result)
  return result
}

proto.tempPop = function() {
  if(this.temporary.length > 0) {
    return this.temporary.pop()
  }
  var ident = 'tmp_' + this.identifiers.length
  this.identifiers.push(ident)
  return ident
}

proto.tempPush = function(x) {
  this.temporary.push(x)
}

proto.print = function(id) {
  var v = this.getVariable(id)
  if(v.type === 'interval') {
    code.push('console.log("' + id + '=",[' + id + '_lo,' + id + '_hi])')
  } else {
    code.push('console.log("' + id + '=",' + id + ')')
  }
}

proto.setArgs = function(args) {
  for(var i=0; i<args.length; ++i) {
    this.args.push(args[i])
    this.variables.push(new Variable(args[i], 'float'))
  }
}

proto.add = function(dst, a, b) {
}

proto.sub = function(dst, a, b) {
}

proto.mul = function(dst, a, b) {
}

proto.end = function(result) {
  var code = []
  var constants = Object.keys(round.CONSTANTS)
  for(var i=0; i<constants.length; ++i) {
    var c = constants[i]
    code.push('var ' + c + '=' + round.CONSTANTS[c])
  }
  code.push(
    'var roundUp=' + round.roundUp.toString(),
    'var roundDown=' + round.roundDown.toString(),
    'function ' + this.name + '_interval(' + this.args + '){')
  for(var i=0; i<this.args.length; ++i) {
    var x = this.args[i]
    code.push(x + '=+' + x)
  }
  code.push(
    'var ' + this.identifiers.join(),
    this.code.join('\n'))
  var resultType = this.getVariable(result).type
  if(resultType === 'number') {
    code.push(
      'if(0<' + result + '){return +1}',
      'if(' + result + '<0){return -1}',
      'if(' + result + '===0){return +0}')
  } else if(resultType === 'interval') {
    code.push(
      'if(0<'+result + '_lo){return -1}',
      'if('+result+'_hi<0){return -1}',
      'if(' + result + '_lo===' + result + '_hi){return +0}')
  }
  if(this.fallback) {
    code.push('return ' + this.fallback + '(' + this.args.join() + ')')
  } else {
    code.push('return NaN')
  }
  code.push('}')
}

function generateCode(ast, options, fallback) {
  var program = new Program(options, fallback)


}