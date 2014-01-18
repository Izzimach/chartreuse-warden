pc.script.attribute('shakeMagnifier','number',2);
pc.script.attribute('shakeDamping','number',12);
pc.script.attribute('shakeSpringConstant','number',700);
pc.script.attribute('followtargetname','string','Avatar');
pc.script.attribute('followdistance','number',15);


pc.script.create('shakeycamera', function (context) {
    // Creates a new Shakeycamera instance
    var Shakeycamera = function (entity) {
        this.entity = entity;
        this.shakevalue = 0.0;
        this.shakevelocity = 0.0;
        
        this.baserotation = this.entity.getLocalRotation().clone();

        this.shakerotation = new pc.Quat();
        this.modifiedrotation = new pc.Quat();
        
        this.baseposition = this.entity.getLocalPosition().clone();
        this.shakeposition = new pc.Vec3();
        
        this.modifiedposition = new pc.Vec3();

        this.shakeaxis = new pc.Vec3(1,0,0);
    };

    Shakeycamera.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.followtarget = this.entity.getRoot().findByName(this.followtargetname);
            this.followoffset = new pc.Vec3();
            this.followoffset.sub2(this.entity.getPosition(), this.followtarget.getPosition()).normalize().scale(this.followdistance);
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            // if following a target, update the position
            if (this.followtarget) {
                this.baseposition.add2(this.followtarget.getLocalPosition(), this.followoffset);
            }

            var shakedamping = (1.0 - dt * this.shakeDamping);
            if (shakedamping < 0) { shakedamping = 0; }
            
            this.shakevelocity = this.shakevelocity  * shakedamping - this.shakevalue * this.shakeSpringConstant * dt;
            this.shakevalue = this.shakevalue + dt * this.shakevelocity;

            var othershakevalue = this.shakevalue * Math.sin(this.shakevalue);
            
            //pc.math.quat.fromAxisAngle(this.shakeaxis, this.shakevalue * this.shakeMagnifier, this.shakerotation);
            this.shakerotation.setFromEulerAngles(this.shakevalue,this.shakevalue * this.shakeMagnifier,-othershakevalue);
            this.modifiedrotation.mul2(this.baserotation, this.shakerotation);
            
            this.entity.setLocalRotation(this.modifiedrotation);
            
            this.shakeposition.set(0,this.shakevalue * this.shakeMagnifier, othershakevalue * this.shakeMagnifier);
            this.modifiedposition.add2(this.baseposition, this.shakeposition);
            
            this.entity.setLocalPosition(this.modifiedposition);
            this.entity.lookAt(this.followtarget.getPosition());
        },
        
        addShake: function(shakeamplitude) {
            //console.log("shake", shakeamplitude);
            this.shakevalue = this.shakevalue + shakeamplitude;
        }
    };

    return Shakeycamera;
});