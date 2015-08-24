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
  this.options = parseOptions(options);
  CachingWriter.call(this, inputTrees, {filterFromCache: {include: [this.options.fileRegEx]}});
}


ReactCaching.prototype.updateCache = function (includePaths, destDir) {
  var options = this.options;
  includePaths.forEach(function (includePath) {
    var inFiles = glob.sync(path.join(includePath, '/**/*.' + options.fileExtension), { nodir: true });
    inFiles.forEach(function (inFile) {
      debug("Processing ", inFile);
      var compiled = compileOrFailGracefully(inFile, options);
      var relativePath = path.relative(includePath, inFile);
      var destFile = path.join(destDir, relativePath).replace(options.fileRegEx, '.js');
      debug("output to: %s", destFile);
      mkdirp.sync(path.dirname(destFile));
      fs.writeFileSync(destFile, compiled, {encoding: options.encoding});
    });
  });
};


function compileOrFailGracefully (inFile, options) {
  var content = fs.readFileSync(inFile, {encoding: options.encoding});
  var compiled;
  try {
    compiled = react(content, options.transformOptions);
  } catch (e) {
    console.error("Failed to compile %s (%s)", inFile, e.toString());
    compiled = "document.write('";
    compiled += '<div style="position: fixed; z-index: 99999999; top: 0; background: black; color: white; padding: 10px">';
    compiled += '<p>Failed to compile the React file <code>' + inFile + '</code></p>';
    compiled += '<p>' + e.toString() + '</p>';
    compiled += "</div>');";
  }
  return compiled;
}


function parseOptions(passedOptions) {
  var options = passedOptions || {};
  options.fileExtension = options.fileExtension || 'jsx';
  options.fileRegEx = new RegExp("\\." + options.fileExtension + '$', 'i');
  options.encoding = options.encoding || 'UTF-8';
  options.transformOptions = options.transformOptions || {};
  return options;
}
