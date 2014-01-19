if (typeof chartreusewarden === 'undefined') {
	chartreusewarden = {};
}

chartreusewarden.generatemap = function(numhexes) {

	var curmap = new chartreusewarden.Hexmap();

	var startposition = [0,0,0];

	var starthex = {hexcoord:startposition, hextype:"grass"};

	curmap.setHex(startposition, starthex);

	// randomly pick a hex and add in one adjacent to it
	for (var ix=0; ix < 5; ix++) {
		var somehex = curmap.randomHex();

		var adjhexes = _.shuffle(curmap.getAdjacentHexes(somehex.hexcoord));

		for (var testix=0; testix < 6; testix++) {
			var curhexcoord = adjhexes[testix];

			// if no hex is here, add a hex and then we're done
			if (curmap.getHex(curhexcoord) === undefined) {
				var newhex = curmap.newHexAt(curhexcoord, "gress");
				curmap.connectHexes(somehex, newhex);

				break;
			}
		}
	}

	return curmap;
};
