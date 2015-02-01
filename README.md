**WORK IN PROGRESS**

exacto
======
A tiny language for specifying exact floating point predicates.

# Example

```javascript
var parse = require('exacto/parse')
var compile = require('exacto')

var program = `
x
`

//Generate the code for the subroutine
var code = compile(parse(program))
console.log(code)

//Using eval we can then run the required predicate
var det2d = (new Function(code))()
console.log(det2d(
  1, -1,
  0,  1))
```

Output:

```
```

# Installation

This language is installable through [npm](http://npmjs.org):

```
npm install --save exacto
```

It works in any reasonable CommonJS environment including [browserify](http://browserify.org/), [webpack](https://webpack.github.io/), [node](http://nodejs.org/) and [iojs](https://iojs.org/).

# Language specification

## Comments

## `input` declaration

## `output` declaration

## Statements



# AST datatype

# API

## Parsing

#### `var ast = require('exacto/parse')`


#### `var source = require('exact/serialize')`

## Compiling

#### `var jscode = require('exacto')`

# Legal
(c) 2015 Mikola Lysenko. MIT License