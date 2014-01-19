if (typeof chartreusewarden === 'undefined') {
	chartreusewarden = {};
}

chartreusewarden.Hexmap = function() {
	this.mapdata = {}

	return this;
};

chartreusewarden.Hexmap.prototype = {
	getAdjacentHexes: function(curhexcoord) {
		var hexX = curhexcoord[0];
		var hexY = curhexcoord[1];
		var hexZ = curhexcoord[2];

		var hex1 = [hexX-1, hexY+1, hexZ  ];
		var hex2 = [hexX+1, hexY-1, hexZ  ];
		var hex3 = [hexX-1, hexY  , hexZ+1];
		var hex4 = [hexX+1, hexY  , hexZ-1];
		var hex5 = [hexX  , hexY-1, hexZ+1];
		var hex6 = [hexX  , hexY+1, hexZ-1];

		return [hex1,hex2,hex3,hex4,hex5,hex6];
	},

	randomHex: function() {
		return _.sample(_.values(this.mapdata));
	},

	// javascript objects hash on strings only. dammit

	coordToString: function(hexcoord) {
		return hexcoord[0].toString() + ',' + hexcoord[1].toString() + ',' + hexcoord[2];
	},

	stringToCoord: function(coordstring) {
		var bits = coordstring.split(',');
		return [parseInt(bits[0]), parseInt(bits[1]), parseInt(bits[2])];
	},

	getHex: function(hexcoord) {
		return this.mapdata[this.coordToString(hexcoord)];
	},

	setHex: function(hexcoord, hexvalue) {
		this.mapdata[this.coordToString(hexcoord)] = hexvalue;
	},

	newHexAt: function(hcoord, htype) {
		var freshhex = {hexcoord: hcoord, hextype:htype, connectedhexes:[], distance:0};
		this.setHex(hcoord, freshhex);

		return freshhex;
	},

	connectHexes: function(hex1, hex2) {
		hex1.connectedhexes.push(hex2);
		hex2.connectedhexes.push(hex1);
	},

	markDistanceFrom: function(starthex) {
		// computes distance to from the start hex(es), following only hex connections

		// mark all hexes with a large distance value
		var allhexes = _.values(this.mapdata);
		_.each(allhexes, function(hex) {hex.distance = allhexes.length+1; });

		if (typeof starthex.length === "undefined")
		{
 			// passed in a single hex
 			starthex.distance = 0;
		} else {
			// passed in an array of hexes (hopefully)
			_.each(starthex, function(hex) {hex.distance = 0;});
		}
	}
}
