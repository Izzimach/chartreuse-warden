pc.script.create("highgrass", function (context) {
 
    var HighGrass = function (entity) {
        this.entity = entity;
        this.whosinhere = null;
    };
 
    HighGrass.prototype = {
        initialize: function () {
            var grassarea = this;

            this.entity.collision.on('triggerenter', function(entity) { grassarea.entergrassarea(entity); });
            this.entity.collision.on('triggerleave', function(entity) { grassarea.leavegrassarea(entity); });

        },

        update: function (dt) {
            if (this.entity.getParent() === null) { return; } // just got destroyed

            // if someone is in here, tell them they can sneak
            if (this.whosinhere) {
                this.whosinhere.setAttributeAsAvailable('sneaky');
            }
        },

        entergrassarea: function (otherentity) {
            if (typeof otherentity.script === 'undefined') { // no scripts! must be a tree or ground
                return;
            }
            
            var shapeshifter = otherentity.script.shapeshifter;
            if (typeof shapeshifter !== 'undefined') {
                this.whosinhere = shapeshifter;
            }
        },

        leavegrassarea: function (otherentity) {
            if (typeof otherentity.script === 'undefined') { // no scripts! must be a tree or ground
                return;
            }
            var shapeshifter = otherentity.script.shapeshifter;
            if (typeof shapeshifter !== 'undefined' &&
                shapeshifter === this.whosinhere) {
                this.whosinhere = null;
            }
        }
    };
    
    return HighGrass;
});
