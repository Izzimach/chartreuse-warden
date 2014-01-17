
pc.script.create('worldmap', function (context) {

    var WorldMap = function (entity) {
        this.entity = entity;
    };

    WorldMap.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            var maplayout = chartreusewarden.generatemap();
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        }
        
    };

    return WorldMap;
});