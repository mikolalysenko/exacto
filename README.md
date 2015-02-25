**WORK IN PROGRESS**

exacto
======
A tiny language for generating exact floating point predicates.

### Motivation

* C.K. Yap, (1997) "[Towards exact geometric computation](ftp://cs.nyu.edu/pub/local/yap/exact/towards.ps.gz)"

# Example

## Command line interface

## High level API usage

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

//Now we compile the predicate:
var det2 = exacto(program)

//And we can execute it in JavaScript directly
console.log('det ( 1 -1 )\n    ( 0  1 ) = \n',
  det2d(1, -1,
        0,  1))
```

Output:

```
```

## Low level API

# Installation

This language is installable through [npm](http://npmjs.org):

```
npm install --save exacto
```

It works in any reasonable CommonJS environment including [browserify](http://browserify.org/), [webpack](https://webpack.github.io/), [node](http://nodejs.org/) and [iojs](https://iojs.org/).

# Language specification

An exacto program consists of a sequence of statements separated by newline characters.  Each line can have a comment which is denoted using the `#` symbol.  Empty lines are skipped as well as whitespace between tokens.

#### `input` declaration

The first line of an exacto program must be an input declaration.  This describes the arguments to the program and is given by an ordered list of whitespace separated identifiers representing the arguments to the program preceded by the token `input:`.  For example,

```
input:  a b c d
```

#### `output` declaration

The second line describes the output variable for the program.  This must be a single identifier preceded by the token `output:`,

```
output:  result
```

#### Statements

Following this is a list of newline delimited statements.  Each statement is of the form:

```
result = left op right
```

Where `result` is an identifier which gets the result of the operation, `left` and `right` are either identifiers or double precision numbers, and `op` is one of the following operators:  `+`, `-`, `*`.  Each variable identifier must be initialized exactly once.

#### Example

```
# Comments start with the # character

input: a b c d   # define inputs for the program
output: det      # define the outputs for the program

# You can define intermediate variables in exacto like this:
ad = a * d
bc = b * c
det = ad - bc
```

# Command line interface

TODO

# API

## High level

#### `var func = require('exacto')(source[, options])`
Compiles a source string into an exacto program

## Low level API

#### `var ast = require('exacto/parse')(source)`
Parse a source file into an AST for code generation.

#### `var source = require('exacto/serialize')(ast)`
Convert a parse tree back into a source string

#### `var jscode = require('exacto/codegen')(ast,options)`
Compile a parse tree into a JavaScript predicate

# Roadmap

Here is a sketch of how this implementation would proceed:

1. Basic parsing/syntax (ok for now)
1. Tracing and debug mode (wip)
1. Exact big integer fixed point calculations (wip)
1. Testing and verification (wip)
1. Interval arithmetic for predicates (wip)
1. Floating point filters
1. Adaptive floating point filters (generalize Shewchuk's method maybe? seems hard to handle denormals/overflow)

Other possible features:

* Target asm.js
* Allow for interval/bigint output
* Multivalued output?  Combine multiple tests into one predicate, for example for point-simplex tests
* More language features: Conditionals, division, rational numbers, square root maybe (Galois extensions)?

Priorities:

* Exactness/correctness
* Speed

# Legal
(c) 2015 Mikola Lysenko. MIT License