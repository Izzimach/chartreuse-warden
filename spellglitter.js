pc.script.attribute('sharematerial','boolean',false);
pc.script.attribute('isdynamic','boolean',false);
pc.script.attribute('startenabled','boolean',false);

pc.script.create('spellglitter', function (context) {
    
    var sharedMaterial = null;

    var SpellGlitter = function (entity) {
        this.entity = entity;
        
        this.emitter = null;
        this.particleSystem = null;
        this.enabled = false;
    };

    SpellGlitter.prototype = {
        initialize: function () {
            this.emitter = new pc.scene.ParticleEmitter(context.graphicsDevice, {numParticles: 50, dynamic:this.isdynamic, positionRange: new pc.Vec3(6,6,6), colorMult: new pc.Vec4(0.2,1,0.8,1), startSize:7, endSize:1, lifeTime:0.5});
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

            if (this.startenabled) {
                this.enable();
            }

            this.paused = false;
        },

        getComponentReference: function() {
            return this;
        },

        pause: function () {
            this.paused = true;  
        },

        unpause: function () {
            this.paused = false;
        },

        update: function (dt) {
            if (!this.paused) {
                this.emitter.addTime(dt);
            }
        },

        restart: function() {
            this.enable();
            this.emitter.time = 0;
        },

        regenerate: function() {
            this.emitter.generate(0,50);
        },
        
        enable: function () {
            if (this.enabled === false) {
                context.scene.addModel(this.particleSystem);
                this.enabled = true;
            }
        },
        
        disable: function () {
            if (this.enabled === true) {
                context.scene.removeModel(this.particleSystem);
                this.enabled = false;
            }
        }
    };

   return SpellGlitter;
});

