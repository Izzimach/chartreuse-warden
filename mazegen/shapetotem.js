
pc.script.attribute('shapename','string','');

pc.script.create("shapetotem", function (context) {
 
    var ShapeTotem = function (entity) {
        this.entity = entity;
        this.rotationangle = 0;
        this.rotationspeed = 25; // degrees/second
        this.didinitialupdate = false;
    };
 
    ShapeTotem.prototype = {
        initialize: function () {
            this.entity.collision.on('triggerenter', _.bindKey(this, 'totemcollide'));
            this.entity.collision.on('triggerleave', _.bindKey(this, 'totemleave'));
            this.totemshape = this.entity.findByName(this.shapename) || null;
            this.didinitialupdate = false;
        },

        update: function (dt) {
            if (!this.didinitialupdate) {
                this.initialUpdate(dt);
            }

            if (this.entity.getParent() === null) { return; } // just got destroyed
            if (this.totemshape === null) { this.entity.destroy(); } // shape has been granted to a shifter

            this.rotationangle += (this.rotationspeed * dt);
            this.entity.setLocalEulerAngles(0,this.rotationangle,0);
        },

        initialUpdate: function(dt) {
            if (this.totemshape !== null) {
                this.entity.removeChild(this.totemshape);
            }
            this.didinitialupdate = true;
        },

        totemcollide: function (otherentity) {
            if (_.isUndefined(otherentity.script)) { // no scripts! must be a tree or ground
                return;
            }
            
            var shapeshifter = otherentity.script.shapeshifter;
            if (!_.isUndefined(shapeshifter)) {
                // attach this to the scene graph under the shapeshifter that collided with the totem
                //shapeshifter.entity.addChild(this.totemshape);
                this.entity.removeChild(this.totemshape);
                shapeshifter.addShape(this.totemshape);
                this.totemshape = null;
            }
        },

        totemleave: function (otherentity) {
        }
    };
    
    return ShapeTotem;
});
