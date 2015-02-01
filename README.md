**WORK IN PROGRESS**

exacto
======
A tiny language for specifying exact floating point predicates.

# Example

```javascript
var parse = require('exacto/parse')
var compile = require('exacto')

var program = `
# Comments start with the # character

input: a b c d   # define inputs for the program
output: det      # define the outputs for the program

# You can define intermediate variables in exacto like this:
ad = a * d
bc = b * c
det = ad - bc
`

//Generate the code for the subroutine
var code = compile(parse(program))
console.log('GENERATED CODE:\n', code, '\n\n\n\n')

//Using eval we can then run the required predicate
var det2d = (new Function(code))()
console.log('det ( 1 -1 )\n    ( 0  1 ) = \n',det2d(
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

An exacto program consists of a sequence of statements separated by newline characters.  Each line can have a comment which is denoted using the `#` symbol.  Empty lines in the input are skipped as well as whitespace between tokens.

#### Variables and literals

Tokens in an exacto program are given by 

#### `input` declaration

The first line of an exacto program must be an input declaration.  This describes the arguments to the program and is given by an ordered 

#### `output` declaration

#### Statements



# API

## Parsing

#### `var ast = require('exacto/parse')(source)`
Parse a 


#### `var source = require('exact/serialize')(ast)`

## Compiling

#### `var jscode = require('exacto')(ast)`

# Legal
(c) 2015 Mikola Lysenko. MIT License