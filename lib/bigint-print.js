module.exports = printBigInt

function printBigInt(heap, id, ptr, len, exp, sgn) {
  var hexStr = ''
  for(var i=0; i<len; ++i) {
    var w = heap[ptr+i].toString(16)
    if(i < len-1)
    while(w.length < 8) {
      w = '0' + w
    }
    hexStr = w + hexStr
  }
  console.log(id + ' = ', 
    ((sgn < 0) ? '-' : '') + hexStr,
    'P',
    exp * 32)
  console.log('\t(ptr=0x' + ptr.toString(16) + ' len=' + len + ' exp=' + exp + ' sgn=' + sgn + ')')
}