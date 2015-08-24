# broccoli-react-caching

React Compiler for Broccoli. Based on [react-sass](https://github.com/joliss/broccoli-sass).

## Installation

```bash
npm install --save-dev broccoli-react-caching
```

## Usage

```js
var react = require('broccoli-react-caching');

var outputTree = react(inputTrees);
```

* **`inputTrees`**: An array of trees that act as the include paths for
  react jsx files. If you have a single tree, pass `[tree]`.

## options

```
react(inputTrees, {
  encoding: 'something', // encoding of the jsx files (defaults to UTF-8)
  transformOptions: {    // These are passed to `transform`
    sourceMap: true
  }
});
```

For all possible `transformOptions`, [see transform in react-tools](https://www.npmjs.com/package/react-tools#transform-inputstring-options).
