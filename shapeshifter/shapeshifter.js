
//
// Sort of manages the various availabe shapes and switches between them.
//
pc.script.attribute('defaultanimationname','string','idle');
pc.script.attribute('shapenamesJSON','string','["GirlShape"]');

pc.script.create('shapeshifter', function (context) {

    // when an attribute is available or used it persists for a short
    // period of time. this value represents that persistant time in seconds
    var attributepersisttime = 0.1;

    var ShapeShifter = function (entity) {
        this.entity = entity;
        this.shapes = {};
        this.activeshape = false;
        this.avatarmovementcomponent = null;
        this.spellglitter = null;
        this.camera = null;
        this.availableattributestimeleft = {};
        this.usingattributetimeleft = {};
    };

    ShapeShifter.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.avatarmovementcomponent = this.entity.script.instances['avatarmovement'].instance;
            this.spellglitter = this.entity.script.instances['spellglitter'].instance;
            this.camera = this.entity.getRoot().findByName('Camera');
            
            this.shapenames = JSON.parse(this.shapenamesJSON);
            this.startshapename = this.shapenames[0];
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            if (this.activeshape) {
            }

            this.updateAttributeStatus(dt);

            // switch shapes?
            if (context.keyboard.wasPressed(pc.input.KEY_Q)) {
                this.switchShape(this.shapenames[0]);
            }
            if (context.keyboard.wasPressed(pc.input.KEY_W)) {
                this.switchShape(this.shapenames[1]);
            }
            if (context.keyboard.wasPressed(pc.input.KEY_E)) {
                this.switchShape(this.shapenames[2]);
            }
            if (context.keyboard.wasPressed(pc.input.KEY_R)) {
                this.switchShape(this.shapenames[3]);
            }
            if (context.keyboard.wasPressed(pc.input.KEY_T)) {
                this.switchShape(this.shapenames[4]);
            }
        },

        addShape: function(shapecomponent) {
            var shapename = shapecomponent.shapename;
            this.shapes[shapename] = shapecomponent;

            if (shapename === this.startshapename) {
                this.switchShape(shapecomponent.shapename);
            }
            return this;
        },

        switchShape: function(shapename) {
            if (shapename === this.activeshape.shapename) { return; }
            
            // find the new shape
            var newshapecomponent = this.shapes[shapename];
            if (newshapecomponent) {
                // disable old shape before switching to the new one
                if (this.activeshape) {
                    this.activeshape.setActiveFlag(false);
                }

                this.activeshape = newshapecomponent;
                newshapecomponent.setActiveFlag(true);

                this.avatarmovementcomponent.movespeed = this.activeshape.movespeed;

                // trigger a spell effect when we switch shapes
                if (this.spellglitter) {
                    this.spellglitter.enable();
                    this.spellglitter.restart();
                }
                this.camera.script.shakeycamera.addShake(0.3);
            }
        },

        // other entities call this to tell the shapeshifter that it can use
        // the specified attribute
        setAttributeAsAvailable: function(attributename) {
            this.availableattributestimeleft[attributename] = attributepersisttime;
        },

        isAttributeAvailable: function(attributename) {
            if (typeof this.availableattributestimeleft[attributename] === "undefined") {
                this.availableattributestimeleft[attributename] = 0;
                return false;
            }

            return (this.availableattributestimeleft[attributename] > 0);
        },

        // specific shapes call this to indicate that they are using a given attribute.
        // this also calls the object that made this attribute available.
        useAttribute: function(attributename) {
            if (this.isAttributeAvailable(attributename)) {
                this.usingattributetimeleft[attributename] = attributepersisttime;
            }
        },

        isUsingAttribute: function(attributename) {
            if (typeof this.usingattributetimeleft[attributename] === "undefined") {
                this.usingattributetimeleft[attributename] = 0;
                return false;
            }

            return (this.usingattributetimeleft[attributename] > 0);
        },

        updateAttributeStatus: function(dt) {
            // decrease the time left of all available and used attributes
            _.forOwn(this.availableattributestimeleft, function(timeleft, attributename, attributes) {
                if (timeleft > 0) {
                    attributes[attributename] = timeleft - dt;
                }
            });

            _.forOwn(this.usingattributetimeleft, function(timeleft, attributename, attributes) {
                if (timeleft > 0) {
                    attributes[attributename] = timeleft - dt;
                }
            });
        }
        
    };

    return ShapeShifter;
});