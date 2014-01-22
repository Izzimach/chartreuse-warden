pc.script.create("rockobstacle", function (context) {
 
    var RockObstacle = function (entity) {
        this.entity = entity;
    };
 
    RockObstacle.prototype = {
        initialize: function () {
        },
        update: function (dt) {
        },

        getComponentReference: function() {
            return this;
        },
    };
    
    return RockObstacle;
});
