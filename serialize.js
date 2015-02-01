'use strict'

module.exports = serializeProgram

function serializeProgram(program) {
  var result = []
  var statements = program.statements
  result.push('input: ' + program.input.join(' '))
  result.push('output: ' + program.output.join(' '))
  for(var i=0; i<statements.length; ++i) {
    var statement = statements[i]
    var lhs       = statement.result
    var op        = statement.op
    var args      = statement.args
    result.push(lhs + '\t= ' + args.join(' ' + op + ' '))
  }
  return result.join('\n')
}