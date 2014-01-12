
//
// This provides a slightly more convenient interface to the availabe animations.
// You can specify a default animation to play, then fire off one-shot animations.
// When the one-shot animations finish this will switch back to the default animation.
//
pc.script.create('animationthunk', function (context) {

    var AnimationThunk = function (entity) {
        this.entity = entity;
        this.shapes = [];
    };

    AnimationThunk.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        },

        getComponentReference: function() {
            return this;
        },

        playOneShot: function(animationname) {

        }
    };

    return AnimationThunk;
});