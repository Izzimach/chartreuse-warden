
//
// Sort of manages the various availabe shapes and switches between them.
//
pc.script.attribute('defaultanimationname','string','idle');

pc.script.create('shapeshifter', function (context) {

    var ShapeShifter = function (entity) {
        this.entity = entity;
        this.shapes = {};
        this.activeshape = false;
    };

    ShapeShifter.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            if (this.activeshape) {

            }
        },

        addShape: function(shapecomponent) {
            var shapename = shapecomponent.shapename;
            this.shapes[shapename] = shapecomponent;

            if (this.activeshape === false) {
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