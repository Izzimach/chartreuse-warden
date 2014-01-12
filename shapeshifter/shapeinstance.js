
//
// Handles the data and animation of a specific shape available to the shapeshifter.
//
pc.script.create('shapeinstance', function (context) {
    // Creates a new Shakeycamera instance
    var ShapeInstance = function (entity) {
        this.entity = entity;
        this.shapeshiftercomponent = null;
        this.animationthunk = null;
        this.shapename = "";
    };

    ShapeInstance.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.shapename = this.entity.getName();

            // should start off disabled
            this.disableShape();

            // the shapeshifter component should be in the parent node
            this.shapeshiftercomponent = this.entity.getParent().script.send('shapeshifter','addShape',this);
            this.animationthunk = this.entity.script.send('animationthunk','getComponentReference');
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        },

        setActiveFlag: function(activeflag) {
            if (activeflag) {
                this.enableShape();
            } else {
                this.disableShape();
            }
        },

        enableShape: function() {
            this.entity.model.setVisible(true);
        },

        disableShape: function() {
            this.entity.model.setVisible(false);
        }
    };

    return ShapeInstance;
});