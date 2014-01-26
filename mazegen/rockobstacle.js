pc.script.create("rockobstacle", function (context) {
 
    var RockObstacle = function (entity) {
        this.entity = entity;
        this.enabled = false;
        this.enabledtimeleft = 0;
        this.rigidbody = null;
    };
 
    RockObstacle.prototype = {
        initialize: function () {
            this.rigidbody = this.entity.rigidbody;
            this.entity.collision.on('contact', _.bindKey(this, 'contacting'));

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

        contacting: function(contactinfo) {
            var otherentity = contactinfo.other;

            // if we are pushed by an entity that has the 'shapeshifter' script we can query and see if it is
            // in a shape that can push this rock
            if (typeof otherentity.script === 'undefined') { // no scripts! must be a tree or ground
                return;
            }

            // tell the shapeshifter it can use the 'strong' attribute.
            // if the shapeshifter uses the strong attribute, then the rock becomes pushable
            var shapeshifter = otherentity.script.shapeshifter;
            if (typeof shapeshifter !== 'undefined') {
                shapeshifter.setAttributeAsAvailable('strong');
                if (shapeshifter.isUsingAttribute('strong')) {
                    this.enabled = true;
                    this.enabledtimeleft = 1.0; // so it rolls for 1 second after being pushed
                }

            }
        }
    };
    
    return RockObstacle;
});
