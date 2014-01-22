
//
// Sort of manages the various availabe shapes and switches between them.
//
pc.script.attribute('defaultanimationname','string','idle');
pc.script.attribute('shapenamesJSON','string','["GirlShape"]');

pc.script.create('shapeshifter', function (context) {

    var ShapeShifter = function (entity) {
        this.entity = entity;
        this.shapes = {};
        this.activeshape = false;
        this.avatarmovementcomponent = null;
        this.spellglitter = null;
        this.camera = null;
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
                this.camera.script.send('shakeycamera','addShake',0.3);
            }
        }
        
    };

    return ShapeShifter;
});