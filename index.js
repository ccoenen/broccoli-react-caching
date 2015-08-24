var debug = require('debug')('broccoli-react-caching');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var CachingWriter = require('broccoli-caching-writer');
var glob = require('glob');
var react = require('react-tools').transform;

module.exports = ReactCompiler;
ReactCompiler.prototype = Object.create(CachingWriter.prototype);
ReactCompiler.prototype.constructor = ReactCompiler;
function ReactCompiler (inputTrees) {
  if (!(this instanceof ReactCompiler)) return new ReactCompiler(inputTrees);
  if (!Array.isArray(inputTrees)) throw new Error('Expected array for first argument - did you mean [tree] instead of tree?');

  CachingWriter.call(this, inputTrees, {filterFromCache: {include: [/\.jsx$/]}});

  this.inputTrees = inputTrees;
  // this.options = options || {};
}


ReactCompiler.prototype.updateCache = function(includePaths, destDir) {
  includePaths.forEach(function (includePath) {
    var inFiles = glob.sync(path.join(includePath, '/**/*.jsx'), { nodir: true });
    inFiles.forEach(function (inFile) {
      debug("Processing ", inFile);
      var content = fs.readFileSync(inFile, {encoding: 'UTF-8'});
      var compiled = react(content);
      var relativePath = path.relative(includePath, inFile);
      var destFile = path.join(destDir, relativePath).replace(/jsx$/i, 'js');
      debug("output to: %s", destFile);
      mkdirp.sync(path.dirname(destFile));
      fs.writeFileSync(destFile, compiled, {encoding: 'UTF-8'});
    });
  });
};
