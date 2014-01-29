pc.script.create("gateguardian", function (context) {
 
    var GateGuardian = function (entity) {
        this.entity = entity;
        this.rigidbody = null;
        this.playeravatar = null;
        this.openspeed = 1.5;
        this.closespeed = 18.0;
        this.detectionrange = 20;
        this.gatetopposition = null;
        this.gatebottomposition = null;

        this.slamsoundenabled = false;
        this.shakeycamera = null;

        this.workvector = new pc.Vec3();
    };
 
    GateGuardian.prototype = {
        initialize: function () {
            this.rigidbody = this.entity.rigidbody;
            this.playeravatar = this.entity.getRoot().findByName('Avatar');
            this.shakeycamera = this.entity.getRoot().findByName('Camera').script.shakeycamera;

            this.gatetopposition = this.entity.findByName('GateTop').getPosition().clone();
            this.gatebottomposition = this.entity.findByName('GateBottom').getPosition().clone();
        },

        update: function (dt) {
            if (this.entity.getParent() === null) { return; } // just got destroyed

            // move to top or bottom position based on proximity of the player avatar
            this.workvector.sub2(this.playeravatar.getPosition(), this.entity.getPosition());
            var avatardistance = this.workvector.length();
            var avatarsneaking = this.playeravatar.script.shapeshifter.isUsingAttribute('sneaky');

            if (avatardistance < this.detectionrange && !avatarsneaking) {
                // player is too close! close the gate
                var closecomplete = this.moveTowardPosition(this.gatebottomposition, this.closespeed, dt);
                if (closecomplete && this.slamsoundenabled) {
                    // don't slam more than once when the gate closes
                    this.slamsoundenabled = false;
                    this.shakeycamera.addShake(3);
                }
            } else  {
                // the player is gone. reopen the gate
                this.moveTowardPosition(this.gatetopposition, this.openspeed, dt);
                this.slamsoundenabled = true;
            }
        },

        moveTowardPosition: function(targetposition, rate, dt) {
            var currentposition = this.entity.getPosition();

            this.workvector.sub2(targetposition, currentposition);

            var distancetotarget = this.workvector.length();

            // reached destination
            if (distancetotarget < 0.1) {
                return true;
            }

            this.workvector.scale(rate * dt / distancetotarget);

            this.workvector.add(currentposition);

            this.entity.setPosition(this.workvector);
            this.rigidbody.syncEntityToBody();

            return false;
        }
    };
    
    return GateGuardian;
});
