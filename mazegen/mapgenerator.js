if (typeof chartreusewarden === 'undefined') {
	chartreusewarden = {};
}

chartreusewarden.generatemap = function(hexspacing, numhexes) {

	var curmap = new chartreusewarden.Hexmap(hexspacing);

	var starthex = curmap.newHexAt([0,0,0]);

	// randomly pick a hex and add in one adjacent to it
	for (var ix=0; ix < 5; ix++) {
		var somehex = curmap.randomHex();

		var adjhexes = _.shuffle(curmap.getAdjacentHexes(somehex.hexcoord));

		for (var testix=0; testix < 6; testix++) {
			var curhexcoord = adjhexes[testix];

			// if no hex is here, add a hex and then we're done
			if (curmap.getHex(curhexcoord) === undefined) {
				var newhex = curmap.newHexAt(curhexcoord, "grass");
				curmap.connectHexes(somehex, newhex);

				break;
			}
		}
	}

	// find a good starting point; we start at some hex (initially chosen randomly) and then
	// find the hex farthest away. Doing this twice in succession should produce a hex at or near the "end"
	// of the map
	function findfarthesthex (fromhex) {
		
	}

	return curmap;
};
