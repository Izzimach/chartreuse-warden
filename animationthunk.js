
//
// This provides a slightly more convenient interface to the availabe animations.
// You can specify a default animation to play, then fire off one-shot animations.
// When the one-shot animations finish this will switch back to the default animation.
//

//
// a JSON object mapping from common animation names like 'idle','walk' to the actual
// animation data. animation data is another map with keys 'name','playspeed', and 'duration'
//
pc.script.attribute('animationmap','string', "{idle:{name:'idle_anim', playspeed:1, duration:1}}");

pc.script.create('animationthunk', function (context) {

    var AnimationThunk = function (entity) {
        this.entity = entity;
        this.shapes = [];
        this.defaultanimation = "";
        this.currentoneshot = "";
        this.isplayingoneshot = false;
        this.oneshottimeleft = 0;
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

        setDefaultAnimation: function(animationname) {
            if (this.defaultanimation !== animationname) {
                this.defaultanimation = animationname;
                var playdata = this.animationmap[animationname];

                if (!this.isplayingoneshot && playdata) {
                    this.entity.animation.loop = true;
                    this.entity.animation.speed = playdata.playspeed;
                    this.entity.animation.play(playdata.name);
                }
            }
        },

        playOneShot: function(animationname) {

        }
    };

    return AnimationThunk;
});