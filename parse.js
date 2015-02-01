'use strict'

var isVariable = require('is-property')

module.exports = parseProgram

var OPERATORS = [ '+', '-', '*' ]

function Program(input, output, statements) {
  this.input = input
  this.output = output
  this.statements = statements
}

function Statement(lhs, op, args, lineNumber) {
  this.result     = lhs
  this.op         = op
  this.args       = args
  this.lineNumber = lineNumber
}

function Line(tokens, lineNumber) {
  this.tokens = tokens
  this.number = lineNumber
}

function notEmpty(tok) {
  return tok.length > 0
}

function isNumber(number) {
  return /^\d+\.?\d*$/.test(number)
}

function isOp(str) {
  return OPERATORS.indexOf(str) >= 0
}

function tokenize(source) {
  var result = []
  var lines = source.split('\n')
  for(var i=0; i<lines.length; ++i) {
    var toks = lines[i]
      .replace(/\#.*$/g, '')   //Strip comments
      .replace(/\+/g, ' + ')   //Expand symbols
      .replace(/\-/g, ' - ')
      .replace(/\*/g, ' * ')
      .replace(/\=/g, ' = ')
      .split(/\s+/)            //Separate tokens
      .filter(notEmpty)        //Remove empty tokens
    if(toks.length > 0) {
      result.push(new Line(toks, i+1))
    }
  }
  return result
}

function parseProgram(source) {
  var lineNumber = 0
  function error(reason) {
    if(lineNumber) {
      throw new Error('exacto-parse (' + lineNumber + '): ' + reason)
    } else {
      throw new Error('exacto-parse: ' + reason)
    }
  }
  if(typeof source !== 'string') {
    error('invalid source')
  }
  var lines = tokenize(source)
  function parseArg(arg) {
    if(isVariable(arg)) {
      return arg
    }
    if(isNumber(arg)) {
      return +arg
    }
    error('invalid argument, "' + arg + '"')
  }
  if(lines.length < 2) {
    error('missing header')
  }
  if(lines[0].tokens.length < 1 || lines[0].tokens[0] !== 'input:') {
    error('missing input section')
  }
  if(lines[1].tokens.length < 1 || lines[1].tokens[0] !== 'output:') {
    error('missing output section')
  }
  var input   = lines[0].tokens.slice(1)
  var output  = lines[1].tokens.slice(1)
  var program = []
  for(var i=2; i<lines.length; ++i) {
    var line        = lines[i]
    var tokens      = line.tokens
    lineNumber = line.number
    if(tokens.length < 3) {
      error('invalid statement')
    }
    if(tokens[1] !== '=') {
      error('missing =')
    }
    if(!isVariable(tokens[0])) {
      error('invalid identifier for left hand side')
    }
    var lhs = tokens[0]
    var args = []
    var op
    if(tokens.length === 3) {
      args.push(parseArg(tokens[2]))
      op = '='
    } else if(tokens.length === 4) {
      if(tokens[2] !== '-') {
        error('invalid arguments, ' + tokens.join())
      }
      op = '-'
      args.push(parseArg(tokens[3]))
    } else {
      op = tokens[3]
      if(!isOp(op)) {
        error('invalid operator ' + op)
      }
      if(tokens.length % 2 !== 1) {
        error('invalid arguments, ' + tokens.join())
      }
      for(var j=2; j<tokens.length; j+=2) {
        args.push(parseArg(tokens[j]))
        if(j + 1 < tokens.length && tokens[j+1] !== op) {
          error('cannot mix operators in a statement')
        }
      }
    }
    program.push(new Statement(lhs, op, args, lineNumber))
  }
  return new Program(input, output, program)
}