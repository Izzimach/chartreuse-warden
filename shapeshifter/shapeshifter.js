
//
// Sort of manages the various availabe shapes and switches between them.
//
pc.script.attribute('defaultanimationname','string','idle');

pc.script.create('shapeshifter', function (context) {

    var ShapeShifter = function (entity) {
        this.entity = entity;
        this.shapes = [];
        this.activeshape = false;
    };

    ShapeShifter.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        },

        addShape: function(shapecomponent) {
            this.shapes.push(shapecomponent);
            if (this.activeshape === false) {
                this.switchShape(shapecomponent.shapename);
            }
            return this;
        },

        switchShape: function(shapename) {
            if (this.activeshape) {
                this.activeshape.setActiveFlag(false);
            }

            // find the new shape
            var newshape = _.
        }
        
    };

    return ShapeShifter;
});