pc.script.attribute('sharematerial','boolean',false);
pc.script.attribute('isdynamic','boolean',false);
pc.script.attribute('startenabled','boolean',false);

pc.script.create('spellglitter', function (context) {

    var sharedMaterial = null;
    var totalparticles = 50;

    var SpellGlitter = function (entity) {
        this.entity = entity;

        this.emitter = null;
        this.particleSystem = null;
        this.particleslive = false;
        this.restarttime = 1;
        this.timetorestart = 0;
    };

    SpellGlitter.prototype = {
        initialize: function () {
            this.emitter = new pc.scene.ParticleEmitter(context.graphicsDevice, {numParticles: totalparticles, dynamic:false, positionRange: new pc.Vec3(6,6,6), colorMult: new pc.Vec4(0.2,1,0.8,1), startSize:7, endSize:1, lifeTime:0.5});
            this.emitter.meshInstance.node = this.entity;

            if (this.sharematerial) {
                if (sharedMaterial) {
                    this.emitter.meshInstance.material = sharedMaterial;
                } else {
                    sharedMaterial = this.emitter.meshInstance.material;
                }
            }

            this.emitter.setColorRamp(
                [100/255, 208/255, 200/255, 1,
                 0, 200/255, 100/255, 1,
                 0, 10/255, 0, 1,
                 0, 0, 0, 0.5,
                 0, 0, 0, 0]);

            this.particleSystem = new pc.scene.Model();
            this.particleSystem.graph = this.entity;
            this.particleSystem.meshInstances = [ this.emitter.meshInstance ];

            this.paused = false;
        },

        postInitialize: function() {
        },

        pause: function () {
            this.paused = true;
        },

        unpause: function () {
            this.paused = false;
        },

        update: function (dt) {
            // if no parent, turn off
            if (this.entity.getParent() === null) { this.onDisable(); }

            if (!this.paused) {
                this.emitter.addTime(dt);
                if (this.isdynamic) {
                    this.timetorestart -= dt;
                    if (this.timetorestart < 0) {
                        this.restart();
                        this.timetorestart = this.restarttime;
                    }
                }
            }
        },

        restart: function() {
            this.onEnable();
            this.emitter.time = 0;
        },

        regenerate: function() {
            this.emitter.generate(0,50);
        },

        onEnable: function () {
            if (this.particleslive === false) {
                context.scene.addModel(this.particleSystem);
                this.particleslive = true;
            }
        },

        onDisable: function () {
            if (this.particleslive === true) {
                context.scene.removeModel(this.particleSystem);
                this.particleslive = false;
            }
        },

        destroy: function() {
          // make sure to remove the particle mesh
          this.onDisable();
        }
    };

   return SpellGlitter;
});

