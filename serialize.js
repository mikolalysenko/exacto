'use strict'

module.exports = serializeProgram

function serializeProgram(program) {
  var result = []
  var statement = program.statements
  result.push('input: ' + program.input.join())
  result.push('output: ' + program.output.join())
  for(var i=0; i<statements.length; ++i) {
    var statement = program[i]
    var lhs       = statement.result
    var op        = statement.op
    var args      = statement.args
    result.push(lhs + '=' + args.join(op))
  }
  return result.join('\n')
}