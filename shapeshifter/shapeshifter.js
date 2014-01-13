
//
// Sort of manages the various availabe shapes and switches between them.
//
pc.script.attribute('defaultanimationname','string','idle');
pc.script.attribute('startshapename','string','StartShape');

pc.script.create('shapeshifter', function (context) {

    var ShapeShifter = function (entity) {
        this.entity = entity;
        this.shapes = {};
        this.activeshape = false;
        this.avatarmovementcomponent = null;
        this.startshapename = 'StartShape';
    };

    ShapeShifter.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.avatarmovementcomponent = this.entity.script.send('avatarmovement','getComponentReference');
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            if (this.activeshape) {
            }

            // switch shapes?
            if (context.keyboard.wasPressed(pc.input.KEY_Q)) {
                this.switchShape("GirlShape");
            }
            if (context.keyboard.wasPressed(pc.input.KEY_W)) {
                this.switchShape("BearShape");
            }
            if (context.keyboard.wasPressed(pc.input.KEY_E)) {
                this.switchShape("LeopardShape");
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
            // find the new shape
            var newshapecomponent = this.shapes[shapename];
            if (newshapecomponent) {
                // disable old shape before switching to the new one
                if (this.activeshape) {
                    this.activeshape.setActiveFlag(false);
                }

                this.activeshape = newshapecomponent;
                newshapecomponent.setActiveFlag(true);
            }
        }
        
    };

    return ShapeShifter;
});