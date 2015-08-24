var debug = require('debug')('broccoli-react-caching');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var CachingWriter = require('broccoli-caching-writer');
var glob = require('glob');
var react = require('react-tools').transform;

module.exports = ReactCaching;
ReactCaching.prototype = Object.create(CachingWriter.prototype);
ReactCaching.prototype.constructor = ReactCaching;
function ReactCaching (inputTrees, options) {
  if (!(this instanceof ReactCaching)) return new ReactCaching(inputTrees, options);
  if (!Array.isArray(inputTrees)) throw new Error('Expected array for first argument - did you mean [tree] instead of tree?');

  this.options = options || {};
  this.options.encoding = this.options.encoding || 'UTF-8';
  this.options.transformOptions = this.options.transformOptions || {};

  CachingWriter.call(this, inputTrees, {filterFromCache: {include: [/\.jsx$/]}});
}


ReactCaching.prototype.updateCache = function(includePaths, destDir) {
  reactCaching = this;
  includePaths.forEach(function (includePath) {
    var inFiles = glob.sync(path.join(includePath, '/**/*.jsx'), { nodir: true });
    inFiles.forEach(function (inFile) {
      debug("Processing ", inFile);
      var content = fs.readFileSync(inFile, {encoding: reactCaching.options.encoding});
      var compiled = react(content, reactCaching.options.transformOptions);
      var relativePath = path.relative(includePath, inFile);
      var destFile = path.join(destDir, relativePath).replace(/jsx$/i, 'js');
      debug("output to: %s", destFile);
      mkdirp.sync(path.dirname(destFile));
      fs.writeFileSync(destFile, compiled, {encoding: reactCaching.options.encoding});
    });
  });
};
