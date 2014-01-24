pc.script.create("rockobstacle", function (context) {
 
    var RockObstacle = function (entity) {
        this.entity = entity;
        this.enabled = false;
        this.enabledtimeleft = 0;
        this.rigidbody = null;
    };
 
    RockObstacle.prototype = {
        initialize: function () {
            var obstacle = this;
            this.rigidbody = this.entity.rigidbody;
            this.entity.collision.on('contact', function(contactinfo) { obstacle.pushed(contactinfo.other); });

            // roll around for a few seconds to stabilize
            this.enabledtimeleft = 2.0;
            this.enabled = true;
        },

        update: function (dt) {
            if (this.entity.getParent() === null) { return; } // just got destroyed

            if (this.enabled) {
                this.rigidbody.type = pc.fw.RIGIDBODY_TYPE_DYNAMIC;

                this.enabledtimeleft -= dt;
                this.enabled = (this.enabledtimeleft > 0);
            } else {
                this.rigidbody.type = pc.fw.RIGIDBODY_TYPE_STATIC;
            }
        },

        pushed: function(otherentity) {
            // if we are pushed by an entity that has the 'shapeshifter' script we can query and see if it is
            // in a shape that can push this rock
            if (typeof otherentity.script === 'undefined') { // no scripts! must be a tree or ground
                return;
            }

            // if the shapeshifter is in a shape that has the 'strong' attribute, the rock moves, otherwise
            // it stays still
            var shapeshifter = otherentity.script.instances['shapeshifter'];
            if (typeof shapeshifter !== 'undefined') {
                var currentshapeattributes = shapeshifter.instance.activeshape.attributes;
                if (_.contains(currentshapeattributes, 'strong')) {
                    this.enabled = true;
                    this.enabledtimeleft = 1.0; // so it rolls for 1 second after being pushed
                }

            }
        }
    };
    
    return RockObstacle;
});
