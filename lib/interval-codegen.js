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
    this.code.push('console.log("' + id + '=",[' + id + '_lo,' + id + '_hi])')
  } else {
    this.code.push('console.log("' + id + '=",' + id + ')')
  }
}

proto.setArgs = function(args) {
  for(var i=0; i<args.length; ++i) {
    this.args.push(args[i])
    this.variables.push(new Variable(args[i], 'float'))
    if(this.traceSteps) {
      this.print(args[i])
    }
  }
}

proto.add = function(dst, a, b) {
  var atype = this.getVariable(a).type
  var btype = this.getVariable(b).type
  this.addVariable(dst)

  if(atype === btype) {
    if(atype === 'number') {
      //number + number
      var temp = this.tempPop()
      this.code.push(
        temp + '=' + a + '+' + b,
        dst + '_lo=roundDown(' + temp + ')',
        dst + '_hi=roundUp(' + temp + ')')
      this.tempPush(temp)
    } else {
      //interval + interval
      this.code.push(
        dst + '_lo=roundDown(' + a + '_lo' + '+' + b + '_lo)',
        dst + '_hi=roundUp(' + a + '_hi' + '+' + b + '_hi)')
    }
  } else {
    if(btype === 'number') {
      var tmp = a
      a = b
      b = a
    }
    //number + interval
    this.code.push(
      dst + '_lo=roundDown(' + a + '+' + b + '_lo)',
      dst + '_hi=roundUp(' + a + '+' + b + '_hi)')
  }
  if(this.traceSteps) {
    this.code.push('console.log("' + dst + '=' + a + '+' + b + '")')
    this.print(dst)
  }
}

proto.sub = function(dst, a, b) {
  var atype = this.getVariable(a).type
  var btype = this.getVariable(b).type
  this.addVariable(dst)

  if(atype === btype) {
    if(atype === 'number') {
      //number + number
      var temp = this.tempPop()
      this.code.push(
        temp + '=' + a + '-' + b,
        dst + '_lo=roundDown(' + temp + ')',
        dst + '_hi=roundUp(' + temp + ')')
      this.tempPush(temp)
    } else {
      //interval + interval
      this.code.push(
        dst + '_lo=roundDown(' + a + '_lo' + '-' + b + '_hi)',
        dst + '_hi=roundUp(' + a + '_hi' + '-' + b + '_lo)')
    }
  } else {
    if(atype === 'number') {
      //number + interval
      this.code.push(
        dst + '_lo=roundDown(' + a + '-' + b + '_hi)',
        dst + '_hi=roundUp(' + a + '-' + b + '_lo)')
    } else {
      //interval + number
      this.code.push(
        dst + '_lo=roundDown(' + a + '_lo-' + b + ')',
        dst + '_hi=roundUp(' + a + '_hi-' + b + ')')
    }
  }
  if(this.traceSteps) {
    this.code.push('console.log("' + dst + '=' + a + '-' + b + '")')
    this.print(dst)
  }
}

proto.mul = function(dst, a, b) {
  var atype = this.getVariable(a).type
  var btype = this.getVariable(b).type
  this.addVariable(dst)

  if(atype === btype) {
    if(atype === 'number') {
      //number * number
      var temp = this.tempPop()
      this.code.push(
        temp + '=' + a + '*' + b,
        dst + '_lo=roundDown(' + temp + ')',
        dst + '_hi=roundUp(' + temp + ')')
      this.tempPush(temp)
    } else {
      //interval * interval
      var tll = this.tempPop()
      var tlh = this.tempPop()
      var thl = this.tempPop()
      var thh = this.tempPop()
      this.code.push(
        tll + '=' + a + '_lo*' + b + '_lo',
        tlh + '=' + a + '_lo*' + b + '_hi',
        thl + '=' + a + '_hi*' + b + '_lo',
        thh + '=' + a + '_hi*' + b + '_hi',
        dst + '_lo=roundDown(Math.min(' + tll + ',' + tlh + ',' + thl + ',' + thh + '))',
        dst + '_hi=roundUp(Math.max(' + tll + ',' + tlh + ',' + thl + ',' + thh + '))')

      this.tempPush(thh)
      this.tempPush(thl)
      this.tempPush(tlh)
      this.tempPush(tll)
    }
  } else {
    if(btype === 'number') {
      var tmp = a
      a = b
      b = a
    }
    //number * interval
    var tx = this.tempPop()
    var ty = this.tempPop()
    this.code.push(
      tx + '=' + a + '*' + b + '_lo',
      ty + '=' + a + '*' + b + '_hi',
      dst + '_lo=roundDown(Math.min(' + tx + ',' + ty + '))',
      dst + '_hi=roundUp(Math.max(' + tx + ',' + ty + '))')
    this.tempPush(ty)
    this.tempPush(tx)
  }
  if(this.traceSteps) {
    this.code.push('console.log("' + dst + '=' + a + '*' + b + '")')
    this.print(dst)
  }
}

proto.end = function(result) {
  var resultType = this.getVariable(result).type
  if(resultType === 'number') {
    this.code.push(
      'if(0<' + result + '){return +1}',
      'if(' + result + '<0){return -1}',
      'if(' + result + '===0){return +0}')
  } else if(resultType === 'interval') {
    this.code.push(
      'if(0<'+result + '_lo){return +1}',
      'if('+result+'_hi<0){return -1}',
      'if(' + result + '_lo===' + result + '_hi){return +0}')
  }
  if(this.fallback) {
    this.code.push('return ' + this.fallback + '(' + this.args.join() + ')')
  } else {
    this.code.push('return NaN')
  }
}

proto.genPredicate = function() {
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
    code.push('\t' + x + '=+' + x)
  }
  code.push('\tvar ' + this.identifiers.join())
  
  if(this.traceSteps) {
    code.push('\tconsole.log("running interval filter")')
  }

  code.push(this.code.map(function(str) { return '\t'+str }).join('\n'), '}')
  return code.join('\n')
}

function generateCode(ast, options, fallback) {
  var program = new Program(options, fallback)
  program.setArgs(ast.input)
  for(var i=0; i<ast.statements.length; ++i) {
    var stmt = ast.statements[i]
    switch(stmt.op) {
      case '+':
        program.add(stmt.result, stmt.args[0], stmt.args[1])
      break
      case '-':
        program.sub(stmt.result, stmt.args[0], stmt.args[1])
      break
      case '*':
        program.mul(stmt.result, stmt.args[0], stmt.args[1])
      break
      default:
        throw new Error('unsupported operation: ' + stmt.op)
    }
  }
  program.end(ast.output[0])

  return {
    heap: 0,
    entry: program.name + '_interval',
    code: program.genPredicate()
  }
}