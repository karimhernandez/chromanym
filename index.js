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
	.description(pkg.description)
	.version(pkg.version)
	.arguments('<color>')
	.action(function (color) {
		run(color);
	})
	.parse(process.argv);

// helpers
function log(msg) {
	if (typeof msg !== 'string') {
		console.log(chalk.dim(JSON.stringify(msg)));
	} else {
		console.log(msg);
	}
}

function error (msg) {
	log(chalk.red(msg));
}

function info (msg) {
	log(chalk.dim(msg));
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
	keys = ['basic', 'html', 'pantone', 'ntc', 'x11']; // 'roygbiv'

	// TODO - Option to specify which dictionaries to use for a match.
	//keys = ['ntc'];

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
	var results, result, color, alpha, name, hex, output;

	try {
		color = chroma(colorStr);
		alpha = color.alpha();
	} catch (ex) {
		//error(ex);
		error('Unable to parse color: ' + colorStr);
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
	hex = cleanColor(result.hex.toLowerCase());
	color = color.hex().toLowerCase();

	if (alpha !== 1) {
		info ('Note: alpha value (' + alpha + ') was ignored');
	}

	if (result.distance === 0) {
		log(chalk.white(name + ', #' + hex + ' (exact match, ' + result.list + ' color list)'));
	} else {
		log(chalk.cyan(name + ', #' + hex + ' (approximate match to ' + color + ')'));
	}
}

// Spit out usage for incorrect number of args
if (program.args.length != 2) {
	help();
}
