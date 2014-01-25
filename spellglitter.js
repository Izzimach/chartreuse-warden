pc.script.create('spellglitter', function (context) {
    
    var sharedMaterial = null;
    
    var SpellGlitter = function (entity) {
        this.entity = entity;
        
        this.emitter = null;
        this.particleSystem = null;
    };

    SpellGlitter.prototype = {
        initialize: function () {
            this.emitter = new pc.scene.ParticleEmitter(context.graphicsDevice, {numParticles: 50, positionRange: new pc.Vec3(6,6,6), colorMult: new pc.Vec4(0.2,1,0.8,1), startSize:7, endSize:1, lifeTime:0.5});
            this.emitter.meshInstance.node = this.entity;
            
            if (sharedMaterial) {
                this.emitter.meshInstance.material = sharedMaterial;
            } else {
                sharedMaterial = this.emitter.meshInstance.material;
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

            context.scene.addModel(this.particleSystem);
            
            var self = this;
            /*var flameimage = context.assets.find('flame.jpg', 'image');
            var texture = new pc.gfx.Texture(context.graphicsDevice);
            texture.minFilter = pc.gfx.FILTER_LINEAR;
            texture.magFilter = pc.gfx.FILTER_LINEAR;
            texture.addressU = pc.gfx.ADDRESS_CLAMP_TO_EDGE;
            texture.addressV = pc.gfx.ADDRESS_CLAMP_TO_EDGE;
            texture.setSource(flameimage);

            this.emitter.setColorMap(texture);*/

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
            this.emitter.time = 0;
        },
        
        enable: function () {
            context.scene.addModel(this.particleSystem);
        },
        
        disable: function () {
            context.scene.removeModel(this.particleSystem);
        }
    };

   return SpellGlitter;
});
