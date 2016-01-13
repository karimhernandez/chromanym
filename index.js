#!/usr/bin/env node
'use strict';

var path = require('path');
var program = require('commander');
var chalk = require('chalk');
var pkg = require(path.join(__dirname, 'package.json'));
var chroma = require('chroma-js');
var namer = require('color-namer');

// CLI setup
program
	.version(pkg.version)
	.arguments('<color>')
	.action(function (color) {
		run(color);
	})
	.parse(process.argv);

// helpers
function error (msg) {
	console.log(chalk.red(msg));
}

function info (msg) {
	console.log(chalk.dim(msg));
}

function help(msg) {
	if (msg) {
		error (msg);
	}
	program.help(function (text) {
		return chalk.red(text);
	});
}

function cleanColor(colorStr) {
	if (typeof colorStr === 'string') {
		return colorStr.replace('#', '');
	}
	return colorStr;
}

// process results
function pluckClosestMatch(results) {
	var i, len, keys, match, result, shortest = 30;

	//keys = Object.keys(results);
	//color dictionaries in order of preference.
	keys = ['basic', 'html', 'pantone', 'ntc', 'x11'];

	for (i = 0, len = keys.length; i < len; i++) {
		match = results[keys[i]][0];
		if (shortest > match.distance) {
			shortest = match.distance;
			result = match;
			result.list = keys[i];
		}
	}

	return result;
}

// main method
function run(colorStr) {
	var results, result, color, name, hex, output, alpha;

	try {
		color = chroma(colorStr);
		alpha = chroma(colorStr).alpha();
	} catch (ex) {
		error(ex);
		//error('Unable to parse color: ' + colorStr);
	}

	if (!color) return;

	try {
		results = namer(colorStr);
	} catch (ex) {
		error(ex);
	}

	if (!results) return;

	result = pluckClosestMatch(results);
	name = result.name.toLowerCase();
	hex = cleanColor(result.hex);

	if (alpha !== 1) {
		info ('Note: alpha value (' + alpha + ') was ignored');
	}

	if (result.distance === 0) {
		console.log(chalk.white(name + ', #' + hex + ' (exact match, ' + result.list + ' color list)'));
	} else {
		console.log(chalk.cyan(name + ', #' + hex + ' (aproximate match)'));
	}
}

// Spit out usage for incorrect number of args
if (program.args.length != 2) {
	help();
}
