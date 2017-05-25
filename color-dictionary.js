'use strict';

var chroma = require('chroma-js');
var distance = require('./euclidean-distance');
var options;

// These `require` statements are all explicit
// to keep the browserify build from breaking
var lists = {
  basic: require('./lib/colors/basic'),
  html: require('./lib/colors/html'),
  ntc: require('./lib/colors/ntc'),
  pantone: require('./lib/colors/pantone'),
  roygbiv: require('./lib/colors/roygbiv'),
  x11: require('./lib/colors/x11')
};

var options = {
  keys: ['basic', 'html', 'ntc', 'pantone', 'roygbiv', 'x11'],
  colors: [] // Color lists expected to have { name: 'foo', hex: '#FFF' }
};

function opt(options, name, defaultValue) {
  return options && options[name] !== undefined ? options[name] : defaultValue;
}

function getResults(color) {
  var results = {};
  if (options.colors.length > 0) {
    lists.custom = options.colors;
  }
  for (var key in lists) {
    results[key] = lists[key]
      .map(function (name) {
        name.distance = distance(color.lab(), chroma(name.hex).lab());
        return name;
      })
      .sort(function (a, b) {
        return a.distance - b.distance;
      })
  }
  return results;
}

function pluckNearest(color) {
  var i, len, keys, match, result, results, shortest = 30;

  results = getResults(color);
  keys = options.keys;

  for (i = 0, len = keys.length; i < len; i++) {
    if (results[keys[i]]) {
      match = results[keys[i]][0];
      if (shortest > match.distance) {
        shortest = match.distance;
        result = match;
        result.list = keys[i];
      }
    }
  }

  return result;
}

function main(color, opts) {
  color = chroma(color);

  opts = opts || {};
  if (opts) {
    options.keys = opt(opts, 'lists', options.keys);
    options.colors = opt(opts, 'colors', options.colors);
  }

  options.keys.unshift('custom');

  return pluckNearest(color);
}


var dict = main;
dict.nearest = pluckNearest;
dict.results = getResults;
dict.chroma = chroma;
dict.lists = lists;

module.exports = dict;
