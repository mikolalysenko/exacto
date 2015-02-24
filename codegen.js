'use strict'

module.exports = generateCode

var compileBigInt = require('./lib/bigint-codegen')


//Future:  Use staged predicates:
//
//  Floating point filter -> Interval arithmetic -> Big int
//

function generateCode(ast, options) {
  options = options || {}
  var exact = compileBigInt(ast, options)

  var heapSize   = exact.heap
  var entryPoint = exact.entry

  var code = [
    'var heap_f64=new Float64Array(' + Math.ceil(heapSize/8) + ')',
    'var heap_u32=new Uint32Array(heap_f64.buffer)',
    'var heap_u16=new Uint16Array(heap_f64.buffer)',
    'var heap_u8=new Uint8AArray(heap_f64.buffer)',
    '\n\n\n\n',
    '/*Exact predicate*/',
    exact.code,
    'return ' + entryPoint
  ]

  return code.join('\n')
}