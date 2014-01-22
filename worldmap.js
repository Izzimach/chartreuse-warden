
pc.script.create('worldmap', function (context) {
    var hexsize = 34;
    var numhexes = 5;

    var WorldMap = function (entity) {
        this.entity = entity;
    };

    WorldMap.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.needtobuild = true;
        },

        buildmap: function() {
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

                freshhex.rigidbody.syncEntityToBody();

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
                var edgeendpoints = hexmap.parseEdgeCoordinateToWorldEndpoints(walllocation);
                var obstaclestep = edgeendpoints[1].clone().sub(edgeendpoints[0]).scale(0.33);
                var walllocation1 = edgeendpoints[0].clone().add(obstaclestep);
                var walllocation2 = walllocation1.clone().add(obstaclestep);

                var freshwall1 = basetree.clone();
                this.entity.addChild(freshwall1);
                freshwall1.setPosition(walllocation1);
                freshwall1.rigidbody.syncEntityToBody();

                var freshwall2 = basetree.clone();
                this.entity.addChild(freshwall2);
                freshwall2.setPosition(walllocation2);
                freshwall2.rigidbody.syncEntityToBody();
            }, this);
            
            // clear out exemplar objects
            basehex.destroy();
            basetree.destroy();

            // position the player at the start hex
            var starthexes = hexmap.findHexesWithTag('start');
            var starthex = starthexes[0];

            var playerentity = this.entity.getRoot().findByName('Avatar');
            playerentity.setPosition(starthex.worldcoord.x, starthex.worldcoord.y + 10, starthex.worldcoord.z);
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            if (this.needtobuild) {
                this.buildmap();
                this.needtobuild = false;
            }
        }
        
    };

    return WorldMap;
});