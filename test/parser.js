'use strict'

var CASES = require('./cases')
var parse = require('../parse')
var serialize = require('../serialize')
var tape = require('tape')

Object.keys(CASES).forEach(function(filename) {
  tape('parse ' + filename, function(t) {
    var src = CASES[filename]
    var ast = parse(src)
    t.equals(serialize(parse(serialize(ast))), serialize(ast))
    t.end()
  })
})