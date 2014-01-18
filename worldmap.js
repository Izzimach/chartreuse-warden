
pc.script.create('worldmap', function (context) {
    var hexsize = 34;

    var WorldMap = function (entity) {
        this.entity = entity;
    };

    WorldMap.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            var basehex = this.entity.findByName("basichex");
            var hexmap = chartreusewarden.generatemap();

            var hexes = _.values(hexmap.mapdata);
            var entity = this.entity;

            // place hexes
            _.each(hexes, function(hex) {
                var hexcoord = hex.hexcoord;
                var hexX = hexsize * hexcoord[0] * Math.sqrt(3) / 2;
                var hexZ = hexsize * (hexcoord[2] + hexcoord[0] * 0.5);
                var hexpixelcoord = new pc.Vec3(hexX, basehex.getPosition().y, hexZ);

                var freshhex = basehex.clone();
                entity.addChild(freshhex);
                freshhex.setPosition(hexpixelcoord);
            });

            basehex.destroy();
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        }
        
    };

    return WorldMap;
});