'use strict'

var CASES = require('./cases')
var parse = require('../parse')
var codegen = require('../codegen')
var tape = require('tape')

Object.keys(CASES).forEach(function(filename) {
  tape('gen ' + filename, function(t) {
    var src = CASES[filename]
    var ast = parse(src)
    
    console.log(codegen(ast, {trace: true}).code)

    t.end()
  })
})