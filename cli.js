#!/usr/bin/env node
'use strict';

var path = require('path');
var fs = require('fs');
var program = require('commander');
var chalk = require('chalk');
var pkg = require(path.join(__dirname, 'package.json'));
var chroma = require('chroma-js');
var dictionary = require('.');

// CLI setup
program
	.description(pkg.description)
	.version(pkg.version)
	.option('-c, --colors <path>', 'provide path to a custom colors json file')
	.option('-l, --lists <list>', 'specify which color lists to search'); // onLists);

program
	.arguments('<color>')
	.action(function (color) {
		run(color);
	});

program.parse(process.argv);

// utilities
function log(msg) {
	if (typeof msg !== 'string') {
		console.log(chalk.gray(JSON.stringify(msg)));
	} else {
		console.log(msg);
	}
}

function error(msg) {
	log(chalk.red(msg));
}

function info(msg) {
	log(chalk.gray(msg));
}

function help(msg) {
	if (msg) {
		error(msg);
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

function fileExists(relativePath) {
	var fullPath = path.join(process.cwd(), relativePath);

	try {
		return fs.statSync(fullPath).isFile();
	}
	catch (err) {
		return false;
	}
}

function readFile(relativePath) {
	var fullPath, content;

	if (fileExists(relativePath)) {
		fullPath = path.join(process.cwd(), relativePath);
		content = fs.readFileSync(fullPath, 'utf8');
		if (!content) {
			error('Unknown error reading from ' + relativePath);
		}
	} else {
		error('File not found ' + relativePath);
	}

	return content;
}

// function onLists(lists) {
// 	if (lists) {

// 	} else {
// 		error('Please specify one of the following lists: ' + Object.keys(dictionary.lists).join(', '));
// 	}
// }

// main method
function run(colorStr) {
	var lists,
		colors = [],
		results,
		result,
		color,
		alpha,
		name,
		hex,
		output;

	try {
		color = chroma(colorStr);
		alpha = color.alpha();
	} catch (ex) {
		//error(ex);
		error('Unable to parse color: ' + colorStr);
	}

	if (!color) return;

	if (program.colors) {
		if (fileExists(program.colors)) {
			colors = JSON.parse(readFile(program.colors));
		} else {
			error('File not found ' + program.colors);
			return;
		}
	}

	if (program.lists) {
		lists = program.lists.split(',');
	} else {
		lists = ['basic', 'html', 'pantone', 'ntc', 'x11']; // 'roygbiv'
	}

	// lists = ['basic', 'html', 'pantone', 'ntc', 'x11']; // 'roygbiv'
	// colors = [{ name: 'stupidname', hex: '#FFFFFF' }];

	try {
		// result = dictionary(colorStr);
		result = dictionary(colorStr, { lists: lists, colors: colors });
	} catch (ex) {
		error(ex);
	}

	if (!result) return;

	name = result.name.toLowerCase();
	hex = cleanColor(result.hex.toLowerCase());
	color = color.hex().toLowerCase();

	if (alpha !== 1) {
		info('Note: alpha value (' + alpha + ') was ignored');
	}

	if (result.distance === 0) {
		log(chalk.white(name + ', #' + hex + ' (exact match, ' + result.list + ' color list)'));
	} else {
		log(chalk.cyan(name + ', #' + hex + ' (approximate match to ' + color + ' from ' + result.list + ' color list)'));
	}
}

// Spit out usage for incorrect number of args
if (program.args.length != 2) {
	help();
}
