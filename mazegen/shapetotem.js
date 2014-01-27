
pc.script.attribute('shapename','string','');

pc.script.create("shapetotem", function (context) {
 
    var ShapeTotem = function (entity) {
        this.entity = entity;
        this.rotationangle = 0;
        this.rotationspeed = 1; // degrees/second
    };
 
    ShapeTotem.prototype = {
        initialize: function () {
        },

        update: function (dt) {
            if (this.entity.getParent() === null) { return; } // just got destroyed

            this.rotationangle += (this.rotationspeed * dt);
            this.entity.setLocalEulerAngles(0,this.rotationangle,0);
        }
    };
    
    return ShapeTotem;
});
