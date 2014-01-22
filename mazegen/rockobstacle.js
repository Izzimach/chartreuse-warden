pc.script.create("rockobstacle", function (context) {
 
    var RockObstacle = function (entity) {
        this.entity = entity;
        this.enabled = false;
        this.rigidbody = null;
    };
 
    RockObstacle.prototype = {
        initialize: function () {

        },

        update: function (dt) {
        }
    };
    
    return RockObstacle;
});
