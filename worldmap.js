
pc.script.create('worldmap', function (context) {
    var hexsize = 34;
    var numhexes = 5;
    var Hexmaplib = chartreusewarden.Hexmap;

    var WorldMap = function (entity) {
        this.entity = entity;
    };

    WorldMap.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.needtobuild = true;
        },

        buildmap: function() {
            var basehex = this.entity.findByName('basichex');
            var basetree = this.entity.findByName('basictree');
            var baserock = this.entity.findByName('rock');
            var marker1 = this.entity.findByName('marker1');
            var marker2 = this.entity.findByName('marker2');

            var worldhexes = chartreusewarden.generatemap(hexsize, numhexes);
            var obstacledata = chartreusewarden.generateobstacles(worldhexes);

            var hexes = _.values(worldhexes.mapdata);
            var entity = this.entity;

            // place hexes
            _.forEach(hexes, function(hex) {
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

            // place notations for the hexes (used for debugging)
            _.forEach(hexes, function(hex) {
                var markercoord = hex.worldcoord.clone();
                markercoord.y += 1;

                // mark spot with a region tag of some sort
                if (_.some(hex.tags, function(tag) {return tag === 'reachable';})) {
                    var freshmarker = marker1.clone();
                    this.entity.addChild(freshmarker);
                    freshmarker.setPosition(markercoord);
                }
            }, this);

            // some hexes are adjacent but not "connected" so we have to place to wall
            // on the non-connected edge.
            var wallplacements = [];
            _.forEach(hexes, function(hex) {
                var hexcoord = hex.hexcoord;
                var adjhexcoords = Hexmaplib.getAdjacentHexCoordinates(hexcoord);

                // if an adjacent hex doesn't exist, we need a wall
                // if an adjacent hex exists but isn't connected to this hex we need a wall
                // if an adjacent hex exists and is connected we don't need a wall
                _.forEach(adjhexcoords, function(adjhexcoord) {
                    var adjhex = worldhexes.getHex(adjhexcoord);
                    var needwall =  ((typeof adjhex === "undefined") || (_.contains(hex.connectedhexes, adjhex) === false));

                    if (needwall) {
                        var edgestring = Hexmaplib.buildEdgeCoordinate(hexcoord, adjhexcoord);

                        // add to the list of walls if it isn't already there
                        if (_.contains(wallplacements, edgestring) === false) {
                            wallplacements.push(edgestring);
                        }
                    }
                }, this);

            }, this);

            // place a tree at each wall location
            _.forEach(wallplacements, function(walllocation) {
                var edgeendpoints = worldhexes.convertEdgeCoordinatesToWorldEndpoints(walllocation);
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

            // place obstacles at obstacle locations
            _.forEach(obstacledata.obstacles, function(obstacle) {
                var hex1coord = obstacle.hex1.hexcoord;
                var hex2coord = obstacle.hex2.hexcoord;
                var obstaclesegment = worldhexes.convertEdgeCoordinatesToWorldEndpoints([hex1coord, hex2coord]);
                var midpoint = obstaclesegment[0].clone().add(obstaclesegment[1]).scale(0.5);
                midpoint.y += 2;

                var freshobstacle = baserock.clone();
                this.entity.addChild(freshobstacle);
                freshobstacle.setPosition(midpoint);
                if (freshobstacle.rigidbody) {
                    freshobstacle.rigidbody.syncEntityToBody();
                }
            }, this);
            
            // clear out exemplar objects
            var exemplarcontainer = this.entity.findByName('exemplars');
            exemplarcontainer.destroy();

            // position the player at the start hex
            var starthexes = worldhexes.findHexesWithTag('start');
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