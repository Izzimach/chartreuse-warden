
//
// Handles the data and animation of a specific shape available to the shapeshifter.
//
pc.script.attribute('movespeed','number',1);
pc.script.attribute('attributesJSON','string','[]');
pc.script.attribute('shapeiconname','string','BearFace');
pc.script.attribute('shapeGUItitle','string');

pc.script.create('shapeinstance', function (context) {
    // Creates a new Shakeycamera instance
    var ShapeInstance = function (entity) {
        this.entity = entity;
        this.shapeshiftercomponent = null;
        this.animationthunk = null;

        this.isactive = true;
        this.attributes = [];
    };

    ShapeInstance.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.shapename = this.entity.name;
            this.animationthunk = this.entity.script.animationthunk;

            this.attributes = JSON.parse(this.attributesJSON);
            if (!_.isArray(this.attributes)) {
                pc.log.warning("Warning: attributesJSON does not parse into an array in object " + this.entity.name);
                pc.log.warning("JSON string: " + this.attributesJSON);
                this.attributes = [];
            }

            // should start off disabled
            this.disableShape();

            this.GUIdata = {shapename: this.shapeGUItitle, iconname: this.shapeiconname, attributestring:this.attributes.join(',') };
        },

        attachedToShifter: function (shapeshifter) {
            this.shapeshiftercomponent = shapeshifter;
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            if (!this.isactive) { return; }

            var mover = this.shapeshiftercomponent.avatarmovementcomponent;
            var animator = this.animationthunk;
            var movespeed = this.movespeed;

            // use certain available attributes
            if (this.shapeshiftercomponent.isAttributeAvailable('strong') &&
                _.contains(this.attributes, 'strong')) {

                this.shapeshiftercomponent.useAttribute('strong');

                // pushing moves at half speed
                movespeed *= 0.5;

            } else if (this.shapeshiftercomponent.isAttributeAvailable('sneaky') &&
                _.contains(this.attributes, 'sneaky')) {

                this.shapeshiftercomponent.useAttribute('sneaky');
                // sneaking moves at half speed
                movespeed *= 0.5;
            }

            mover.movespeed = movespeed;

            // is an attribute active? if so, we may need to modify the animation and/or
            // movement behavior
            if (this.shapeshiftercomponent.isUsingAttribute('strong')) {
                mover.movementenabled = true;
                if (mover.ismoving) {
                    animator.setDefaultAnimation('push');
                } else  {
                    animator.setDefaultAnimation('idle');
                }
            } else if (this.shapeshiftercomponent.isUsingAttribute('sneaky')) {
                mover.movementenabled = true;
                if (mover.ismoving) {
                    animator.setDefaultAnimation('sneak');
                } else  {
                    animator.setDefaultAnimation('idle');
                }
            } else {
                // no active attribute
                // switch between running and idle animations as appropriate
                mover.movementenabled = true;
                if (mover.ismoving) {
                    animator.setDefaultAnimation('run');
                } else {
                    animator.setDefaultAnimation('idle');
                }
            }
        },

        setActiveFlag: function(activeflag) {
            if (activeflag) {
                this.enableShape();
            } else {
                this.disableShape();
            }
        },

        enableShape: function() {
            if (this.isactive === false) {
                context.scene.addModel(this.entity.model.model);

            }
            this.isactive = true;
            //this.entity.model.setVisible(true);
        },

        disableShape: function() {
            if (this.isactive === true) {
                context.scene.removeModel(this.entity.model.model);
            }
            this.isactive = false;
            //this.entity.model.setVisible(false);
        }
    };

    return ShapeInstance;
});