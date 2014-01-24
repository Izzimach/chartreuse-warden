
//
// Handles the data and animation of a specific shape available to the shapeshifter.
//
pc.script.attribute('movespeed','number',1);

pc.script.create('shapeinstance', function (context) {
    // Creates a new Shakeycamera instance
    var ShapeInstance = function (entity) {
        this.entity = entity;
        this.shapeshiftercomponent = null;
        this.animationthunk = null;

        this.usingattribute = false;
        this.usingattributename = "";
        this.usingattributetimeleft = 0;

        this.shapename = "";
        this.isactive = false;
        this.attributes = [];
    };

    ShapeInstance.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.shapename = this.entity.getName();

            if (this.shapename == "BearShape") { this.attributes.push('strong');}

            // should start off disabled
            this.disableShape();

            // the shapeshifter component should be in the parent node
            this.animationthunk = this.entity.script.instances['animationthunk'].instance;
            this.shapeshiftercomponent = this.entity.getParent().script.send('shapeshifter','addShape',this);
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            if (!this.isactive) { return; }

            // is an attribute active? if so, we need to modify the animation
            if (this.usingattribute) {
                this.usingattributetimeleft -= dt;
                this.usingattribute = (this.usingattributetimeleft > 0);


            } else {
                // no active attribute
                // switch between running and idle animations as appropriate
                if (this.shapeshiftercomponent.avatarmovementcomponent) {
                    if (this.shapeshiftercomponent.avatarmovementcomponent.ismoving) {
                        this.animationthunk.setDefaultAnimation('run');
                    } else {
                        this.animationthunk.setDefaultAnimation('idle');
                    }
                }
            }

        },

        usingAttribute: function(attributename) {
            this.usingattributetimeleft = 0.2;
            this.usingattributename = attributename;
            this.usingattribute = true;
        },

        setActiveFlag: function(activeflag) {
            if (activeflag) {
                this.enableShape();
            } else {
                this.disableShape();
            }
        },

        enableShape: function() {
            this.isactive = true;
            this.entity.model.setVisible(true);
        },

        disableShape: function() {
            this.isactive = false;
            this.entity.model.setVisible(false);
        }
    };

    return ShapeInstance;
});