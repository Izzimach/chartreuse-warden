if (typeof chartreusewarden === 'undefined') {
	chartreusewarden = {};
}

chartreusewarden.Hexmap = function(hexspacing) {
	this.mapdata = {}
	this.hexspacing = hexspacing;

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
        var hexX = this.hexspacing * hcoord[0] * Math.sqrt(3) / 2;
        var hexZ = this.hexspacing * (hcoord[2] + hcoord[0] * 0.5);
        var hexworldcoord = new pc.Vec3(hexX, 0, hexZ);

		var freshhex = {hexcoord: hcoord, worldcoord: hexworldcoord, hextype:htype, connectedhexes:[], tags:[], distance:0};
		this.setHex(hcoord, freshhex);

		return freshhex;
	},

	hexCoordToWorldCoord: function(hexcoord) {
        var hexX = this.hexspacing * hexcoord[0] * Math.sqrt(3) / 2;
        var hexZ = this.hexspacing * (hexcoord[2] + hexcoord[0] * 0.5);
        var hexworldcoord = new pc.Vec3(hexX, 0, hexZ);

		return new pc.Vec3(hexX, 0, hexZ);		
	},

	connectHexes: function(hex1, hex2) {
		hex1.connectedhexes.push(hex2);
		hex2.connectedhexes.push(hex1);
	},

	buildEdgeCoordinate: function (hex1coord,hex2coord) {
        // to define a specific edge, we specify the two hexes on either side of the edge
        var hex1coordstring = this.coordToString(hex1coord);
        var hex2coordstring = this.coordToString(hex2coord);

        // use the coordinate that comes first lexigraphically, to avoid repeat edges
        if (hex1coordstring < hex2coordstring) {
            return hex1coordstring + ':' + hex2coordstring;
        } else {
            return hex2coordstring + ':' + hex1coordstring;
        }
   	},

	parseEdgeCoordinate: function (edgestring) {
		var hexstrings = edgestring.split(':');
		var hex1coord = this.stringToCoord(hexstrings[0]);
		var hex2coord = this.stringToCoord(hexstrings[1]);
		return [hex1coord, hex2coord];
	},

	parseEdgeCoordinateToWorldEndpoints: function(edgestring) {
		var hexcoords = this.parseEdgeCoordinate(edgestring);
		var hex1worldcoord = this.hexCoordToWorldCoord(hexcoords[0]);
		var hex2worldcoord = this.hexCoordToWorldCoord(hexcoords[1]);
		var midpoint = hex1worldcoord.clone().add(hex2worldcoord).scale(0.5);

		// using geometry we know that the edge is perpendicular to the line between the two hex centers
		// and scaled by 1/sqrt(3)
		var edgebisector = hex2worldcoord.clone().sub(hex1worldcoord);

		// here we rotate by 90 degrees
		var edgevector = new pc.Vec3(-edgebisector.z, edgebisector.y, edgebisector.x).scale(1.0/Math.sqrt(3));

		// we have the center of the edge and a vector representing the entire segment. now just
		// halve the segment and use that to locate the endpoints
		var halfedge = edgevector.clone().scale(0.5);

		var endpoint1 = midpoint.clone().add(halfedge);
		var endpoint2 = midpoint.clone().sub(halfedge);

		return [endpoint1, endpoint2];
	},

	findHexesWithTag: function(searchtag) {
		return _.chain(this.mapdata)
			.values()
			.filter(function(x) {return _.contains(x.tags, searchtag);})
			.value();
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
			// passed in an array of hexes (hopefully!)
			_.each(starthex, function(hex) {hex.distance = 0;});
		}

		// now iterate. for each hex, see if any adjacent hexes are closer to the start than this hex.
		// (that is, some adjacent hex has a stored distance value smaller than the distance stored in this hex)
		// if they are, we should adjust the distance of this hex to be one greater than the distance of
		// the closer adjacent hex
		var shoulditerate = true;
		while (shoulditerate) {
			shoulditerate = false;

			_.each(allhexes, function (hex) {
				// check adjacent hexes. are any closer than this hex?
				var closestadjacent = _.min(hex.connectedhexes, function(hex) { return hex.distance; });
				if (closestadjacent.distance + 1 < hex.distance) {
					hex.distance = closestadjacent.distance + 1;
					shoulditerate = true; // proper values haven't propagated to all hexes yet
				}
			});
		}
	}
}
