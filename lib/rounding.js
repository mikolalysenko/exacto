var ONE_PLUS_ULP  = 1.0 + Math.pow(2, -52)
var ONE_MINUS_ULP = 1.0 - Math.pow(2, -53)
var DENORMAL      = Math.pow(2, -1024)
var MIN_FLOAT     = Math.pow(2, -1074)

exports.CONSTANTS = {
  ONE_PLUS_ULP:   ONE_PLUS_ULP,
  ONE_MINUS_ULP:  ONE_MINUS_ULP,
  DENORMAL:       DENORMAL,
  MIN_FLOAT:      MIN_FLOAT
}

function roundUp(x) {
  x = +x
  if(x > +0) {
    if(x < DENORMAL) {
      return +(x + MIN_FLOAT)
    }
    return +(x * ONE_PLUS_ULP)
  } else if(x < 0) {
    if(x > -DENORMAL) {
      return +(x + MIN_FLOAT)
    }
    return +(x * ONE_MINUS_ULP)
  } else {
    return +x
  }
}
exports.roundUp = roundUp

function roundDown(x) {
  x = +x
  if(x > 0) {
    if(x < DENORMAL) {
      return +(x - MIN_FLOAT)
    }
    return +(x * ONE_MINUS_ULP)
  } else if(x < 0) {
    if(x > -DENORMAL) {
      return +(x - MIN_FLOAT)
    }
    return +(x * ONE_PLUS_ULP)
  } else {
    return +x
  }
}
exports.roundDown = roundDown