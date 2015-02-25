'use strict'

var tape = require('tape')
var round = require('../lib/rounding')

tape('round up', function(t) {

  //Special values
  t.equals(round.roundUp(0), Number.MIN_VALUE)
  t.equals(round.roundUp(Infinity), Infinity)
  t.equals(round.roundUp(round.CONSTANTS.MAX_FLOAT), Infinity)
  t.equals(round.roundUp(-Number.MIN_VALUE), 0)
  t.equals(round.roundUp(-Infinity), -Number.MAX_VALUE)

  t.equals(round.roundDown(0), -Number.MIN_VALUE)
  t.equals(round.roundDown(-Infinity), -Infinity)
  t.equals(round.roundDown(-round.CONSTANTS.MAX_FLOAT), -Infinity)
  t.equals(round.roundDown(Number.MIN_VALUE), 0)
  t.equals(round.roundDown(Infinity), Number.MAX_VALUE)

  //fuzz test
  for(var i=0; i<1000; ++i) {
    var x = Math.random()
    t.ok(round.roundUp(x) > x, 'round up ok: ' + x)
    t.ok(round.roundDown(x) < x, 'round down ok: ' + x)
  }
  for(var i=0; i<1000; ++i) {
    var x = (0.5-Math.random()) * Math.pow(2, (Math.random()-0.5) * 2000)
    t.ok(round.roundUp(x) > x, 'round up big ok: ' + x)
    t.ok(round.roundDown(x) < x, 'round down big ok: '+ x)
  }

  //Test boundary conditions near powers of 2
  for(var i=1023; i>=-1074; --i) {
    var x = Math.pow(2, i)
    t.ok(round.roundUp(x) > x, 'round up po2: ' + x + ', i=' + i)
    t.ok(round.roundDown(x) < x, 'round down po2: ' + x + ', i=' + i)

    t.ok(round.roundUp(-x) > -x, 'round up po2: ' + (-x) + ', i=' + i)
    t.ok(round.roundDown(-x) < -x, 'round down po2: ' + (-x) + ', i=' + i)

    var xl = round.CONSTANTS.ONE_PLUS_ULP * x
    if(xl < Infinity) {
      t.ok(round.roundUp(xl) > xl, 'round up: ' + xl)
      t.ok(round.roundDown(xl) < xl, 'round down: ' + xl)
      t.ok(round.roundUp(-xl) > -xl, 'round up: ' + (-xl))
      t.ok(round.roundDown(-xl) < -xl, 'round down: ' + (-xl))
    }

    var xr = round.CONSTANTS.ONE_MINUS_ULP * x
    if(xr > 0) {
      t.ok(round.roundUp(xr) > xr, 'round up: ' + xr)
      t.ok(round.roundDown(xr) < xr, 'round down: ' + xr)
      t.ok(round.roundUp(-xr) > -xr, 'round up: ' + (-xr))
      t.ok(round.roundDown(-xr) < -xr, 'round down: ' + (-xr))
    }
  }
  t.end()
})