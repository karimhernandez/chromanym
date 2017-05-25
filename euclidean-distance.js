'use strict';

function distanceSquared(a, b) {
	var sum = 0
	var n
	for (n = 0; n < a.length; n++) {
		sum += Math.pow(a[n] - b[n], 2)
	}
	return sum
}

function euclideanDistance(a, b) {
	return Math.sqrt(distanceSquared(a, b))
}

module.exports = euclideanDistance;