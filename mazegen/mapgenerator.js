if (typeof chartreusewarden === 'undefined') {
	var chartreusewarden = {};
};

chartreusewarden.generatemap = function(hexspacing, numhexes) {
	var Hexmap = chartreusewarden.Hexmap;

	var curmap = new Hexmap(hexspacing);

	var centerhex = curmap.newHexAt([0,0,0]);

	// randomly pick a hex and add in one adjacent to it
	for (var ix=0; ix < 5; ix++) {
		var somehex = curmap.randomHex();

		var adjhexes = _.shuffle(Hexmap.getAdjacentHexCoordinates(somehex.hexcoord));

		for (var testix=0; testix < 6; testix++) {
			var curhexcoord = adjhexes[testix];

			// if no hex is here, add a hex and then we're done
			if (curmap.getHex(curhexcoord) === undefined) {
				var newhex = curmap.newHexAt(curhexcoord, "grass");
				Hexmap.connectHexes(somehex, newhex);

				break;
			}
		}
	}

	// find a good starting point; we start at some hex (initially chosen randomly) and then
	// find the hex farthest away. Doing this twice in succession should produce a hex at or near the "end"
	// of the map
	function findfarthesthex (fromhex) {
		curmap.markDistanceFrom(fromhex);

		var farthesthex = _.chain(curmap.mapdata)
				.values()
				.max(function(x) { return x.distance; })
				.value();

		return farthesthex;
	}

	var starthex = centerhex;
	starthex = findfarthesthex(starthex);
	starthex = findfarthesthex(starthex);

	starthex.tags.push('start');

	var endhex = findfarthesthex(starthex);
	endhex.tags.push('end');


	return curmap;
};
