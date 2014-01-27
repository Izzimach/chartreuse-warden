
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
        this.didinitialupdate = false;
    };

    ShapeShifter.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.avatarmovementcomponent = this.entity.script.avatarmovement;
            this.spellglitter = this.entity.script.spellglitter;
            this.camera = this.entity.getRoot().findByName('Camera');
            
            this.shapenames = JSON.parse(this.shapenamesJSON);
            this.startshapename = this.shapenames[0];
            this.didinitialupdate = false;

        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            if (!this.didinitialupdate) {
                this.initialUpdate(dt);
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

        initialUpdate: function(dt) {
            this.didinitialupdate = true;

            var isshapeinstance = function(node) {
                return (!_.isUndefined(node.script) && !_.isUndefined(node.script.shapeinstance));

            };

            var addinitialshape = function(shape) {
                this.entity.removeChild(shape);
                this.addShape(shape);
            };

            // pick up all children that are shape instances and add them
            _(this.entity.getChildren())
                .filter(isshapeinstance)
                .forEach(addinitialshape, this);
        },

        addShape: function(shapeentity) {
            var shapecomponent = shapeentity.script.shapeinstance;
            var shapename = shapecomponent.shapename;

            this.shapes[shapename] = shapecomponent;
            shapecomponent.attachedToShifter(this);

            if (shapename === this.startshapename) {
                this.switchShape(shapename);
            }
            return this;
        },

        switchShape: function(shapename) {
            if (shapename === this.activeshape.shapename) { return; }
            
            // find the new shape
            var newshapecomponent = this.shapes[shapename];
            if (!_.isUndefined(newshapecomponent)) {
                // disable old shape before switching to the new one
                if (this.activeshape) {
                    this.activeshape.setActiveFlag(false);
                    this.entity.removeChild(this.activeshape.entity);
                }

                this.activeshape = newshapecomponent;
                this.entity.addChild(this.activeshape.entity);
                newshapecomponent.setActiveFlag(true);

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
            var attributetime = this.availableattributestimeleft[attributename];

            if (_.isUndefined(attributetime)) {
                this.availableattributestimeleft[attributename] = 0;
                return false;
            }

            return (attributetime > 0);
        },

        // specific shapes call this to indicate that they are using a given attribute.
        // this also calls the object that made this attribute available.
        useAttribute: function(attributename) {
            if (this.isAttributeAvailable(attributename)) {
                if (this.usingattributetimeleft[attributename] <= 0) {
                    this.startedUsingAttribute(attributename);
                }
                this.usingattributetimeleft[attributename] = attributepersisttime;
            }
        },

        isUsingAttribute: function(attributename) {
            var attributetime = this.usingattributetimeleft[attributename];
            if (_.isUndefined(attributetime)) {
                this.usingattributetimeleft[attributename] = 0;
                return false;
            }

            return (attributetime > 0);
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
                    if (attributes[attributename] <= 0) {
                        this.stoppedUsingAttribute(attributename);
                    }
                }
            }, this);
        },

        startedUsingAttribute: function(attributename) {
            pc.log.write('started using attribute ' + attributename);
        },

        stoppedUsingAttribute: function(attributename) {
            pc.log.write('stopped using attribute ' + attributename);
        }
        
    };

    return ShapeShifter;
});
