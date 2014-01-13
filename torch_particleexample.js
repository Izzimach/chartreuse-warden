pc.script.create('torch', function (context) {
    
    var sharedMaterial = null;
    
    var Torch = function (entity) {
        this.entity = entity;
        
        this.emitter = null;
        this.particleSystem = null;
    };

    Torch.prototype = {
        initialize: function () {
            this.emitter = new pc.scene.ParticleEmitter(context.graphicsDevice);
            this.emitter.meshInstance.node = this.entity;
            
            if (sharedMaterial) {
                this.emitter.meshInstance.material = sharedMaterial;
            } else {
                sharedMaterial = this.emitter.meshInstance.material;
            }
            
            this.emitter.setColorRamp(
                [253/255, 208/255, 55/255, 1,
                 207/255, 80/255, 1/255, 1,
                 0, 0, 0, 1,
                 0, 0, 0, 0.5,
                 0, 0, 0, 0]);

            this.particleSystem = new pc.scene.Model();
            this.particleSystem.graph = this.entity;
            this.particleSystem.meshInstances = [ this.emitter.meshInstance ];

            context.scene.addModel(this.particleSystem);
            
            var self = this;
            context.assets.getAssetResource(context.loader, 'flame.jpg', 'image', function (image) {
                var texture = new pc.gfx.Texture(context.graphicsDevice);
                texture.minFilter = pc.gfx.FILTER_LINEAR;
                texture.magFilter = pc.gfx.FILTER_LINEAR;
                texture.addressU = pc.gfx.ADDRESS_CLAMP_TO_EDGE;
                texture.addressV = pc.gfx.ADDRESS_CLAMP_TO_EDGE;
                texture.setSource(image);
                self.emitter.setColorMap(texture);
            }.bind(this));

            var game = context.root.findByName('Game');
            var instance = game.script.getScript('game');
            instance.on('pause', this.pause, this);
            instance.on('unpause', this.unpause, this);
            this.paused = false;
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
        
        enable: function () {
            context.scene.addModel(this.particleSystem);
        },
        
        disable: function () {
            context.scene.removeModel(this.particleSystem);
        }
    };

   return Torch;
});