
pc.script.create('worldmap', function (context) {
    var hexsize = 34;
    var numhexes = 5;

    var WorldMap = function (entity) {
        this.entity = entity;
    };

    WorldMap.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            var basehex = this.entity.findByName("basichex");
            var basetree = this.entity.findByName("basictree");

            var hexmap = chartreusewarden.generatemap(hexsize, numhexes);

            var hexes = _.values(hexmap.mapdata);
            var entity = this.entity;

            // place hexes
            _.each(hexes, function(hex) {
                var worldcoord = hex.worldcoord;

                // nudge meshes up and down a little bit to avoid z-fighting of the flat ground
                var perturbedworldcoord = new pc.Vec3(worldcoord.x, basehex.getPosition().y + Math.random() * 0.04 - 0.02, worldcoord.z);

                var freshhex = basehex.clone();
                this.entity.addChild(freshhex);
                freshhex.setPosition(perturbedworldcoord);

                // randomize rotation
                var rotationangle = Math.floor(Math.random() * 6) * 60;
                var newrotation = new pc.Quat();
                newrotation.setFromEulerAngles(0,rotationangle,0);
                freshhex.setLocalRotation(newrotation.mul(freshhex.getLocalRotation()));

            }, this);

            // some hexes are adjacent but not "connected" so we have to place to wall
            // on the non-connected edge.
            var wallplacements = [];
            _.each(hexes, function(hex) {
                var hexcoord = hex.hexcoord;
                var adjhexcoords = hexmap.getAdjacentHexes(hexcoord);

                // if an adjacent hex doesn't exist, we need a wall
                // if an adjacent hex exists but isn't connected to this hex we need a wall
                // if an adjacent hex exists and is connected we don't need a wall
                _.each(adjhexcoords, function(adjhexcoord) {
                    var adjhex = hexmap.getHex(adjhexcoord);
                    var needwall =  ((typeof adjhex === "undefined") || (_.contains(hex.connectedhexes, adjhex) === false));

                    if (needwall) {
                        var edgestring = hexmap.buildEdgeCoordinate(hexcoord, adjhexcoord);

                        // add to the list of walls if it isn't already there
                        if (_.contains(wallplacements, edgestring) === false) {
                            wallplacements.push(edgestring);
                        }
                    }
                }, this);

            }, this);

            // place a tree at each wall location
            _.each(wallplacements, function(walllocation) {
                var hexcoords = hexmap.parseEdgeCoordinate(walllocation);
                var hex1worldcoord = hexmap.hexCoordToWorldCoord(hexcoords[0]);
                var hex2worldcoord = hexmap.hexCoordToWorldCoord(hexcoords[1]);
                var walllocation = new pc.Vec3();
                walllocation.add2(hex1worldcoord, hex2worldcoord);
                walllocation.scale(0.5);

                var freshwall = basetree.clone();
                this.entity.addChild(freshwall);
                freshwall.setPosition(walllocation);
            }, this);
            
            // clear out exemplar objects
            basehex.destroy();
            basetree.destroy();
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        }
        
    };

    return WorldMap;
});