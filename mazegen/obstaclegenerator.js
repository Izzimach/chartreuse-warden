if (typeof chartreusewarden === 'undefined') {
	var chartreusewarden = {};
};

chartreusewarden.generateobstacles = (function() {
	// add the given tag to this hex an all adjacent hexes. You can specify a function to restrict
	// the fill algorithm. Make your function take a given hex and return false if that hex is not to be
	// filled.
	function floodFillTag(hex, name, dontfillhex) {
		if (dontfillhex(hex)) return;

		if (_.contains(hex.tags, name)) {
			return; // already been here
		}
		hex.tags.push(name);
		_.each(hex.connectedhexes, function (adjhex) {
			floodFillTag(adjhex, name, dontfillhex);
		})
	}

	function buildObstacle(hex1,hex2,obstaclename) {
		return { hex1:hex1, hex2:hex2, name:name, type:""};
	}

	// returns true if going from hex1 to hex2 crosses the indicated obstacle
	function crossesObstacle(hex1, hex2, obstacle) {
		return (hex1 === obstacle.hex1 && hex2 === obstacle.hex2) ||
			(hex2 === obstacle.hex1 && hex1 === obstacle.hex2);
	}

	// given a start hex, finds all hexes accessible without crossing the provided obstacles
	function findReachableHexes(starthex, obstacles) {
		pc.log.write("obstacle at " + obstacles[0].hex1.hexcoord.toString() + "-" + obstacles[0].hex2.hexcoord.toString());
		var isBlocked = function(hex1,hex2) { 
			var obstaclehere = _.some(obstacles, function(obs) {return crossesObstacle(hex1,hex2,obs);});
			pc.log.write("isblocked? " + hex1.hexcoord.toString() + "-" + hex2.hexcoord.toString() + ":" + obstaclehere.toString());
			return obstaclehere;
		};

		var reachablehexes = [starthex];

		return findReachableHexes_recur(starthex, isBlocked, reachablehexes);
	}

	function findReachableHexes_recur(hex, isBlockedFunc, reachablessofar) {
		// check all adjacent hexes. If any are not blocked and not already
		// found as reachable, add them and recurse
		_.each(hex.connectedhexes, function(adjhex) {
			if (!_.contains(reachablessofar, adjhex) && !isBlockedFunc(hex,adjhex)) {
				reachablessofar.push(adjhex);
				findReachableHexes_recur(adjhex, isBlockedFunc, reachablessofar);
			}
		});

		return reachablessofar;
	}

	var generator = function(hexmap) {
		var starthexes = hexmap.findHexesWithTag('start');
		var endhexes = hexmap.findHexesWithTag('end');

		// mark distances from the start hex(es)
		hexmap.markDistanceFrom(starthexes);

		// randomly place an obstacle
		var obstaclestarthex = hexmap.randomHex();
		// pick some adjacent hex at random
		var obstacleendhex = _.sample(obstaclestarthex.connectedhexes);

		var obstacle = buildObstacle(obstaclestarthex, obstacleendhex, 'testobstacle');
		var obstaclelist = [obstacle];

		var reachablehexes = findReachableHexes(starthexes[0], obstaclelist);
		_.each(reachablehexes, function(hex) {hex.tags.push('reachable');});

		return { obstacles: obstaclelist};
	}

	return generator;
})();