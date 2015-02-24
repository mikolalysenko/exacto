'use strict'

module.exports = generateCode

var printBigInt = require('./bigint-print')

function Variable(id, size) {
  this.id       = id        //id of variable
  this.size     = size      //size of variable in bytes
}

function Program(options) {
  this.littleEndian = false
  this.types       = {
    'heap_top': 'unsigned'
  }
  this.args        = []
  this.temporary   = {}
  this.identifiers = ['heap_top=0>>>0']
  this.code        = []
  this.variables   = []
  this.heapSize    = 0
  this.traceSteps  = !!options.trace
  this.name        = options.name || 'predicate'
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

proto.addVariable = function(id, size) {
  var result = new Variable(id, size)
  this.heapSize += size
  this.identifiers.push(
    id + '_len',
    id + '_exp',
    id + '_sgn',
    id + '_ptr')
  this.types[id + '_len'] = 'unsigned'
  this.types[id + '_exp'] = 'unsigned'
  this.types[id + '_sgn'] = 'int'
  this.types[id + '_ptr'] = 'unsigned'
  this.variables.push(result)
  return result
}

proto.tempPop = function(type) {
  type = type || 'unsigned'
  var pool = this.temporary[type]
  if(!pool) {
    pool = this.temporary[type] = []
  }
  if(pool.length > 0) {
    return pool.pop()
  }
  var id = 'tmp_' + this.identifiers.length + '_' + pool.length
  this.identifiers.push(id)
  this.types[id] = type
  return id
}

proto.tempPush = function(id) {
  this.temporary[this.types[id]].push(id)
}

proto.print = function(v) {
  this.code.push(
    'printBigInt(heap_u32,"' + 
      v + '",' +
      v + '_ptr,' +
      v + '_len,' +
      v + '_exp,' +
      v + '_sgn)')
}

proto.setArgs = function(args) {
  var pendingUnpack = []
  for(var i=0; i<args.length; ++i) {
    this.args.push('_' + args[i])
    var v = this.addVariable(args[i], 3)
    pendingUnpack.push(v)
    this.code.push('heap_f64[' + (2*i) + ']=+_' + args[i])
  }
  var lo = this.tempPop()
  var hi = this.tempPop()
  var scratch = this.tempPop()
  var w0 = this.tempPop()
  var w1 = this.tempPop()
  var w2 = this.tempPop()
  for(var i=0; i<pendingUnpack.length; ++i) {
    var v = pendingUnpack[i]
    var dst = v.id
    this.code.push(
      'if(_' + args[i] + '){',

        '\t' + lo + '=heap_u32[' + (4*i) + ']>>>0',
        '\t' + hi + '=heap_u32[' + (4*i + 1) + ']>>>0',
        '\t' + dst + '_exp=((' + hi + '<<1)>>>21)|0',
        '\t' + dst + '_sgn=(((' + hi + '>>31)<<1)+1)|0',
        '\t' + dst + '_ptr=heap_top>>>0',
        '\t' + hi + '=(' + hi + '&' + ((1<<20)-1) + ')>>>0',

        '\tif(' + dst + '_exp===4095){',
        '\t\treturn NaN',
        '\t}else if(' + dst + '_exp){',
          '\t\t' + hi + '=(' + hi + '|' + (1<<20) + ')>>>0',
        '\t}',

        '\t' + scratch + '=(' + dst + '_exp&31)>>>0',
        '\t' + dst + '_exp=' + dst + '_exp>>>5',

        '\tif(' + scratch + '<16){',
          '\t\t' + w0 + '=(' + lo + '<<(32-' + scratch + '))>>>0',
          '\t\t' + w1 + '=((' + hi + '<<(32-' + scratch + '))+(' + lo + '>>' + scratch + '))>>>0',
          '\t\t' + w2 + '=(' + hi + '>>' + scratch + '))>>>0',
        '\t}else{',
          '\t\t' + w0 + '=0>>>0',
          '\t\t' + w1 + '=(' + lo + '<<(32-' + scratch + '))>>>0',
          '\t\t' + w2 + '=((' + hi + '<<(32-' + scratch + '))+(' + lo + '>>' + scratch + '))>>>0',
        '\t}',

        '\tif(' + w0 + '){',
          '\t\theap_u32[' + dst + '_ptr]=' + w0,
          '\t\theap_u32[' + dst + '_ptr+1]=' + w1,
          '\t\theap_u32[' + dst + '_ptr+2]=' + w2,
          '\t\t' + dst + '_len=3>>>0',
          '\t\theap_top=(heap_top+3)>>>0',
        '\t}else if(' + w1 + '){',
          '\t\theap_u32[' + dst + '_ptr]=' + w1,
          '\t\theap_u32[' + dst + '_ptr+1]=' + w2,
          '\t\t' + dst + '_len=2>>>0',
          '\t\t' + dst + '_exp=(' + dst + '_exp+1)>>>0',
          '\t\theap_top=(heap_top+2)>>>0',
        '\t}else{',
          '\t\theap_u32[' + dst + '_ptr]=' + w2,
          '\t\t' + dst + '_len=1>>>0',
          '\t\t' + dst + '_exp=(' + dst + '_exp+2)>>>0',
          '\t\theap_top=(heap_top+1)>>>0',
        '\t}',

      '}else{',
        '\t' + dst + '_exp=' + dst + '_sgn=' + dst + '_ptr=' + dst + '_len=0',
      '}')
    if(this.traceSteps) {
      this.print(dst)
    }
  }
  this.tempPush(w2)
  this.tempPush(w1)
  this.tempPush(w0)
  this.tempPush(scratch)
  this.tempPush(lo)
  this.tempPush(hi)
}

proto.add = function(dst, a, b) {
  var res = this.addVariable(dst, 1)

  if(this.traceSteps) {
    this.code.push('console.log("' + dst + ' = ' + a + ' + ' + b + '")')
    this.print(dst)
  }
}

proto.sub = function(dst, a, b) {
  var res = this.addVariable(dst, 1)

  if(this.traceSteps) {
    this.code.push('console.log("' + dst + ' = ' + a + ' - ' + b + '")')
    this.print(dst)
  }
}

proto.mul = function(dst, a, b) {
  var res = this.addVariable(dst, 1)

  if(this.traceSteps) {
    this.code.push('console.log("' + dst + ' = ' + a + ' * ' + b + '")')
    this.print(dst)
  }
}

proto.end = function(retval) {
  this.code.push('return +' + retval + '_sgn')
}

proto.genPredicate = function() {
  var str = [
    this.traceSteps ? 'var printBigInt=' + printBigInt.toString() + '\n' : '',
    'function ' + this.name + '_exact(' + this.args.join() + '){',
      this.args.map(function(id) {
        return '\t' + id + '=+' + id
      }).join('\n'),
      '\tvar ' + this.identifiers.join(),
      this.traceSteps ? '\tconsole.log("running exact fallback")' : '',
      this.code.map(function(line) {
        return '\t' + line
      }).join('\n'),
    '}'
  ]
  return str.join('\n')
}

function generateCode(ast, options) {
  var program = new Program(options)
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
    heap: 4 * Math.max(program.heapSize, 4 * ast.input.length),
    entry: program.name + '_exact',
    code: program.genPredicate()
  }
}