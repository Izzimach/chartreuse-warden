if (typeof chartreusewarden === 'undefined') {
	var chartreusewarden = {};
};

chartreusewarden.generateobstacles = (function() {
	// add the given tag to this hex an all adjacent hexes. You can specify a function to restrict
	// the fill algorithm. Make your function take a given hex and return false if that hex is not to be
	// filled.
	function floodfill(hex, name, dontfillhex) {
		if (dontfillhex(hex)) return;

		if (_.contains(hex.tags, name)) {
			return; // already been here
		}
		hex.tags.push(name);
		_.each(hex.connectedhexes, function (adjhex) {
			floodfill(adjhex, name, dontfillhex);
		})
	}

	// given a hex map and an edge (defined by two adjacent hexes) this function
	// divides the map into two regions, one region on each side of the edge.
	// The hexes in each region are all given a certain tag (or no tag if you don't pass in anything)
	function partitionAtEdge(hexmap, hex1, hex2, hex1regionname, hex2regionname) {
		// just flood fill from hex1, without going into hex2
		if (typeof hex1regionname !== 'undefined') {
			floodfill(hex1, hex1regionname, function(hex) {return hex === hex2;});
		}

		if (typeof hex2regionname !== 'undefined') {
			floodfill(hex2, hex2regionname, function(hex) { return hex === hex1;});
		}
	};

	function getTagsWithPrefix(somehex, prefix) {
		// filter out all tags without the given prefix
		return _.filter(somehex.tags, function(tag) { return x.indexOf(prefix) === 0; });
	};

	// gets all region tags in the hex (they all start with some known prefix) and
	// merges them into a big string. Region tags are lexigraphically sorted before
	// merged, so all hexes that have the same set of region tags should get the
	// same merged result
	function buildRegionID(somehex, regionprefix) {
		var regiontags = getTagsWithPrefix(somehex, regionprefix);
		var sortedtags = _.sortBy(regiontags, function(x) {return x;});
		return sortedtags.join(':');
	};

	var generator = function(hexmap) {
		var starthexes = hexmap.findHexesWithTag('start');
		var endhexes = hexmap.findHexesWithTag('end');

		// mark distances from the start hex(es)
		hexmap.markDistanceFrom(starthexes);

		// randomly place an obstacle
		var obstaclestarthex = hexmap.randomHex();
		// pick some adjacent hex at random
		var obstacleendhex = _.sample(obstaclestarthex.connectedhexes);

		partitionAtEdge(hexmap, obstaclestarthex, obstacleendhex, 'preobstacle','postobstacle');
	}

	return generator;
})();