'use strict'

var fs = require('fs')
var path = require('path')

module.exports = {
  'det2': fs.readFileSync(path.join(__dirname, 'predicates/det2.exact')).toString(),
  'orient2': fs.readFileSync(path.join(__dirname, 'predicates/orient2.exact')).toString()
}