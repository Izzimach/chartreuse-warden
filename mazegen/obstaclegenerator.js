if (typeof chartreusewarden === 'undefined') {
	var chartreusewarden = {};
};

//
// places obstacles (doors) along with keys to open the doors
// a lot of the code here is to figure out:
// 1. where the place the doors
// 2. where to place keys so that all the doors can be opened
//

chartreusewarden.generateobstacles = (function() {
	
	//
	// add the given tag to this hex an all adjacent hexes. You can specify a function to restrict
	// the fill algorithm. Make your function take a given hex and return false if that hex is not to be
	// filled.
	//

	function floodFillTag(hex, name, dontfillhex) {
		if (dontfillhex(hex)) return;

		if (_.contains(hex.tags, name)) {
			return; // already been here
		}
		hex.tags.push(name);
		_.each(hex.connectedhexes, function (adjhex) {
			floodFillTag(adjhex, name, dontfillhex);
		})
	};

	function buildObstacle(hex1,hex2,obstaclename) {
		return { hex1:hex1, hex2:hex2, name:name, keyhex:null, type:""};
	};

	// returns true if going from hex1 to hex2 crosses the indicated obstacle
	function crossesObstacle(hex1, hex2, obstacle) {
		return (hex1 === obstacle.hex1 && hex2 === obstacle.hex2) ||
			(hex2 === obstacle.hex1 && hex1 === obstacle.hex2);
	};

	// given a start hex, finds all hexes accessible without crossing the provided obstacles
	function findReachableHexes(starthex, obstacles) {
		//pc.log.write("obstacle at " + obstacles[0].hex1.hexcoord.toString() + "-" + obstacles[0].hex2.hexcoord.toString());
		var isBlocked = function(hex1,hex2) { 
			var obstaclehere = _.some(obstacles, function(obs) {return crossesObstacle(hex1,hex2,obs);});
			//pc.log.write("isblocked? " + hex1.hexcoord.toString() + "-" + hex2.hexcoord.toString() + ":" + obstaclehere.toString());
			return obstaclehere;
		};

		var reachablehexes = [starthex];

		return findReachableHexes_recur(starthex, isBlocked, reachablehexes);
	};

	function findReachableHexes_recur(hex, isBlockedFunc, reachablessofar) {
		//pc.log.write('at hex ' + hex.hexcoord.toString());

		// check all adjacent hexes. If any are not blocked and not already
		// found as reachable, add them and recurse
		_.each(hex.connectedhexes, function(adjhex) {
			if (!_.contains(reachablessofar, adjhex) && !isBlockedFunc(hex,adjhex)) {
				reachablessofar.push(adjhex);
				findReachableHexes_recur(adjhex, isBlockedFunc, reachablessofar);
			}
		});

		return reachablessofar;
	};

	function placeNewObstacle(hexmap, name, previousobstacles, minhexdistance) {
		// find a hex that isn't yet "used" by an obstacle
		// (that is, no obstacle refers to it)
		var referencedbyobstacle = function(hex) {
			return _.some(previousobstacles, function(obst) { return (obst.hex1 === hex || obst.hex2 === hex); });
		};
		var satisfiesdistanceconstraint = function(hex) {
			return hex.distance >= minhexdistance;
		};
		var hexallowed = function(hex) {
			return (satisfiesdistanceconstraint(hex) && !referencedbyobstacle(hex));
		};
		var allowedhexes = _(hexmap.allHexes()).filter(hexallowed).valueOf();
		if (allowedhexes.length === 0) {
			pc.log.error("No hexes available in which to place obstacles!");
			return undefined;
		}

		var enterhex = _.sample(allowedhexes);

		// pick a connected hex to be the other side of the obstacle - this may
		// pick a hex that's already used. oh well.
		var exithex = _.sample(enterhex.connectedhexes);

		return buildObstacle(enterhex, exithex, name)
	};

	var generator = function(hexmap, numobstacles) {
		var starthexes = hexmap.findHexesWithTag('start');
		var starthex = starthexes[0];
		var endhexes = hexmap.findHexesWithTag('end');

		// mark distances from the start hex(es)
		hexmap.markDistanceFrom(starthexes);

		var obstaclelist = [];
		for (var ix=0; ix < numobstacles; ix++) {
			var newobstacle = placeNewObstacle(hexmap, "obstacle" + ix.toString(), obstaclelist, 2);
			obstaclelist.push(newobstacle);
		}

		// now place keys

		var obstacleswithoutkeys = _.clone(obstaclelist);

		// each element in this array contains hexes accessable after passing each obstacle in sequence.
		// so element 0 lists hexes reachable at the start, element 1 list hexes reachable by passing
		// the first obstacle, etc.
		var reachablehexprogression = [findReachableHexes(starthex, obstaclelist)];
		while (obstacleswithoutkeys.length > 0) {
			var reachablehexes = findReachableHexes(starthex, obstacleswithoutkeys);

			// get a list of obstacles still "closed" but accessable
			var reachableobstacles = _.filter(obstacleswithoutkeys, function(obstacle) {
				return (_.contains(reachablehexes, obstacle.hex1) ||
					    _.contains(reachablehexes, obstacle.hex2));
			}, this);

			// randomly pick one reachable obstacle at random to be the next obstacle to "open"
			var nextobstacle = _.sample(reachableobstacles);

			// hex1 is always the "open" side so it has to be the reachable hex. if it's not, switch
			// hex1 and hex2
			if (_.contains(reachablehexes, nextobstacle.hex2)) {
				var temp = nextobstacle.hex2;
				nextobstacle.hex2 = nextobstacle.hex1;
				nextobstacle.hex1 = temp;
			}

			// the last entry in the reachable hex progression contains hexes that were just made reachable.
			// so we should stick the key in there
			nextobstacle.keyhex = _.sample(_.last(reachablehexprogression));

			// now that this obstacle is passed, hexes on the other side become reachable
			var nextreachableregion = findReachableHexes(nextobstacle.hex2, obstaclelist);
			reachablehexprogression.push(nextreachableregion);

			// this obstacle has a key now, so remove it!
			_.pull(obstacleswithoutkeys, nextobstacle);
		}

		return { obstacles: obstaclelist};
	}

	return generator;
})();