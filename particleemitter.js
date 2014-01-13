pc.gfx.programlib.particle = {
    generateKey: function (device, options) {
        var key = "particle";
        return key;
    },

    createShaderDefinition: function (device, options) {
        /////////////////////////
        // GENERATE ATTRIBUTES //
        /////////////////////////
        var attributes = {
            particle_uvLifeTimeFrameStart: pc.gfx.SEMANTIC_ATTR0,
            particle_positionStartTime: pc.gfx.SEMANTIC_ATTR1,
            particle_velocityStartSize: pc.gfx.SEMANTIC_ATTR2,
            particle_accelerationEndSize: pc.gfx.SEMANTIC_ATTR3,
            particle_spinStartSpinSpeed: pc.gfx.SEMANTIC_ATTR4,
            particle_colorMult: pc.gfx.SEMANTIC_ATTR5
        }

        ////////////////////////////
        // GENERATE VERTEX SHADER //
        ////////////////////////////
        var getSnippet = pc.gfx.programlib.getSnippet;
        var code = '';

        // VERTEX SHADER INPUTS: ATTRIBUTES
        code += "attribute vec4 particle_uvLifeTimeFrameStart;\n"; // uv, lifeTime, frameStart
        code += "attribute vec4 particle_positionStartTime;\n";    // position.xyz, startTime
        code += "attribute vec4 particle_velocityStartSize;\n";    // velocity.xyz, startSize
        code += "attribute vec4 particle_accelerationEndSize;\n";  // acceleration.xyz, endSize
        code += "attribute vec4 particle_spinStartSpinSpeed;\n";   // spinStart.x, spinSpeed.y
        code += "attribute vec4 particle_colorMult;\n";            // multiplies color and ramp textures

        // VERTEX SHADER INPUTS: UNIFORMS
        code += "uniform mat4 matrix_viewProjection;\n";
        code += "uniform mat4 matrix_model;\n";
        code += "uniform mat4 matrix_viewInverse;\n";
        code += "uniform vec3 particle_worldVelocity;\n";
        code += "uniform vec3 particle_worldAcceleration;\n";
        code += "uniform float particle_timeRange;\n";
        code += "uniform float particle_time;\n";
        code += "uniform float particle_timeOffset;\n";
        code += "uniform float particle_frameDuration;\n";
        code += "uniform float particle_numFrames;\n\n";

        // VERTEX SHADER OUTPUTS
        code += "varying vec2 vUv0;\n";
        code += "varying float vAge;\n";
        code += "varying vec4 vColor;\n\n";

        // VERTEX SHADER BODY
        code += "void main(void)\n";
        code += "{\n";
        code += "    vec2 uv = particle_uvLifeTimeFrameStart.xy;\n";
        code += "    float lifeTime = particle_uvLifeTimeFrameStart.z;\n";
        code += "    float frameStart = particle_uvLifeTimeFrameStart.w;\n";
        code += "    vec3 position = particle_positionStartTime.xyz;\n";
        code += "    float startTime = particle_positionStartTime.w;\n";
        code += "    vec3 velocity = (matrix_model * vec4(particle_velocityStartSize.xyz, 0.0)).xyz + particle_worldVelocity;\n";
        code += "    float startSize = particle_velocityStartSize.w;\n";
        code += "    vec3 acceleration = (matrix_model * vec4(particle_accelerationEndSize.xyz, 0.0)).xyz + particle_worldAcceleration;\n";
        code += "    float endSize = particle_accelerationEndSize.w;\n";
        code += "    float spinStart = particle_spinStartSpinSpeed.x;\n";
        code += "    float spinSpeed = particle_spinStartSpinSpeed.y;\n";
        code += "    float localTime = mod((particle_time - particle_timeOffset - startTime), particle_timeRange);\n";
        code += "    float percentLife = localTime / lifeTime;\n";
        code += "    float frame = mod(floor(localTime / particle_frameDuration + frameStart), particle_numFrames);\n";
        code += "    float uOffset = frame / particle_numFrames;\n";
        code += "    float u = uOffset + (uv.x + 0.5) * (1.0 / particle_numFrames);\n";
        code += "    vUv0 = vec2(u, uv.y + 0.5);\n";
        code += "    vColor = particle_colorMult;\n";
        code += "    vec3 basisX = matrix_viewInverse[0].xyz;\n";
        code += "    vec3 basisZ = matrix_viewInverse[1].xyz;\n";
        code += "    float size = mix(startSize, endSize, percentLife);\n";
        code += "    size = (percentLife < 0.0 || percentLife > 1.0) ? 0.0 : size;\n";
        code += "    float s = sin(spinStart + spinSpeed * localTime);\n";
        code += "    float c = cos(spinStart + spinSpeed * localTime);\n";
        code += "    vec2 rotatedPoint = vec2(uv.x * c + uv.y * s, \n";
        code += "                             -uv.x * s + uv.y * c);\n";
        code += "    vec3 localPosition = vec3(basisX * rotatedPoint.x +\n";
        code += "                              basisZ * rotatedPoint.y) * size +\n";
        code += "                              velocity * localTime +\n";
        code += "                              acceleration * localTime * localTime + \n";
        code += "                              position;\n";
        code += "    vAge = percentLife;\n";
        code += "    gl_Position = matrix_viewProjection * vec4(localPosition + matrix_model[3].xyz, 1.0);\n";
        code += "}";
        
        var vshader = code;

        //////////////////////////////
        // GENERATE FRAGMENT SHADER //
        //////////////////////////////
        code = getSnippet(device, 'fs_precision');

        // FRAGMENT SHADER INPUTS: VARYINGS
        code += "varying vec2 vUv0;\n";
        code += "varying float vAge;\n";
        code += "varying vec4 vColor;\n";

        // FRAGMENT SHADER INPUTS: UNIFORMS
        code += "uniform sampler2D texture_colorMap;\n";
        code += "uniform sampler2D texture_rampMap;\n\n";

        code += "void main(void)\n";
        code += "{\n";
        code += "    vec4 colorMult = texture2D(texture_rampMap, vec2(vAge, 0.5)) * vColor;\n";
        code += "    gl_FragColor = texture2D(texture_colorMap, vUv0) * colorMult;\n";
        code += "}";

        var fshader = code;

        return {
            attributes: attributes,
            vshader: vshader,
            fshader: fshader
        };
    }
};

pc.extend(pc.scene, function () {

    var particleVerts = [
        [-0.5, -0.5],
        [ 0.5, -0.5],
        [ 0.5,  0.5],
        [-0.5,  0.5]
    ];

    var plusMinus = function(range) {
        return (Math.random() - 0.5) * range * 2;
    };

    var plusMinusVector = function(range) {
        var v = [];
        for (var ii = 0; ii < range.length; ++ii) {
            v.push(plusMinus(range[ii]));
        }
        return v;
    };

    var _createTexture = function (graphicsDevice, width, height, pixelData) {
        var texture = new pc.gfx.Texture(graphicsDevice, {
            width: width,
            height: height,
            format: pc.gfx.PIXELFORMAT_R8_G8_B8_A8,
            cubemap: false,
            autoMipmap: true
        });
        var pixels = texture.lock();

        pixels.set(pixelData);

        texture.unlock();

        texture.addressU = pc.gfx.ADDRESS_CLAMP_TO_EDGE;
        texture.addressV = pc.gfx.ADDRESS_CLAMP_TO_EDGE;
        texture.minFilter = pc.gfx.FILTER_LINEAR;
        texture.magFilter = pc.gfx.FILTER_LINEAR;

        return texture;
    };

    var ParticleEmitter = function ParticleEmitter(graphicsDevice, numParticles) {
        this.graphicsDevice = graphicsDevice;
        
        // The number of particles to emit.
        this.numParticles = 1;
        // The number of frames in the particle texture.
        this.numFrames = 1;
        // The frame duration at which to animate the particle texture in seconds per
        // frame.
        this.frameDuration = 1;
        // The initial frame to display for a particular particle.
        this.frameStart = 0;
        // The frame start range.
        this.frameStartRange = 0;
        // The life time of the entire particle system.
        // To make a particle system be continuous set this to match the lifeTime.
        this.timeRange = 99999999;
        // The startTime of a particle.
        this.startTime = null;
        // The lifeTime of a particle.
        this.lifeTime = 1;
        // The lifeTime range.
        this.lifeTimeRange = 0;
        // The starting size of a particle.
        this.startSize = 1;
        // The starting size range.
        this.startSizeRange = 0;
        // The ending size of a particle.
        this.endSize = 1;
        // The ending size range.
        this.endSizeRange = 0;
        // The starting position of a particle in local space.
        this.position = [0, 0, 0];
        // The starting position range.
        this.positionRange = [0, 0, 0];
        // The velocity of a paritcle in local space.
        this.velocity = [0, 0, 0];
        // The velocity range.
        this.velocityRange = [0, 0, 0];
        // The acceleration of a particle in local space.
        this.acceleration = [0, 0, 0];
        // The accleration range.
        this.accelerationRange = [0, 0, 0];
        // The starting spin value for a particle in radians.
        this.spinStart = 0;
        // The spin start range.
        this.spinStartRange = 0;
        // The spin speed of a particle in radians.
        this.spinSpeed = 0;
        // The spin speed range.
        this.spinSpeedRange = 0;
        // The color multiplier of a particle.
        this.colorMult = [1, 1, 1, 1];
        // The color multiplier range.
        this.colorMultRange = [0, 0, 0, 0];
        // The velocity of all paritcles in world space.
        this.worldVelocity = [0, 0, 0];
        // The acceleration of all paritcles in world space.
        this.worldAcceleration = [0, 0, 0];
        // Whether these particles are oriented in 2d or 3d. true = 2d, false = 3d.
        this.billboard = true;
        // The orientation of a particle. This is only used if billboard is false.
        this.orientation = [0, 0, 0, 1];

        this.numParticles = 30;
        this.lifeTime = 2;
        this.timeRange = 2;

        this.startSize = 0.5;
        this.endSize = 1;
        this.velocity = [0, 1, 0];
        this.velocityRange = [0.25, 0.25, 0.25];
        this.worldAcceleration = [0, -0.32, 0];
        this.spinSpeedRange = 4;

        if (!graphicsDevice.getProgramLibrary().isRegistered('particle')) {
            graphicsDevice.getProgramLibrary().register('particle', pc.gfx.programlib.particle);
        }

        var programLib = graphicsDevice.getProgramLibrary();
        var program = programLib.getProgram("particle", { 
            fog: true 
        });

        // Create the particle vertex format
        var vertexFormat = new pc.gfx.VertexFormat(graphicsDevice, [
            { semantic: pc.gfx.SEMANTIC_ATTR0, components: 4, type: pc.gfx.ELEMENTTYPE_FLOAT32 },
            { semantic: pc.gfx.SEMANTIC_ATTR1, components: 4, type: pc.gfx.ELEMENTTYPE_FLOAT32 },
            { semantic: pc.gfx.SEMANTIC_ATTR2, components: 4, type: pc.gfx.ELEMENTTYPE_FLOAT32 },
            { semantic: pc.gfx.SEMANTIC_ATTR3, components: 4, type: pc.gfx.ELEMENTTYPE_FLOAT32 },
            { semantic: pc.gfx.SEMANTIC_ATTR4, components: 4, type: pc.gfx.ELEMENTTYPE_FLOAT32 },
            { semantic: pc.gfx.SEMANTIC_ATTR5, components: 4, type: pc.gfx.ELEMENTTYPE_FLOAT32 }
        ]);

        var vertexBuffer = new pc.gfx.VertexBuffer(graphicsDevice, vertexFormat, 4 * this.numParticles);

        var position = pc.math.vec3.create();
        var velocity = pc.math.vec3.create();
        var acceleration = pc.math.vec3.create();

        var iterator = new pc.gfx.VertexIterator(vertexBuffer);
        for (var p = 0; p < this.numParticles; p++) {
            var lifeTime = this.lifeTime;
            var startTime = (p * lifeTime / this.numParticles);
            var frameStart = this.frameStart + plusMinus(this.frameStartRange);
            pc.math.vec3.add(this.position, plusMinusVector(this.positionRange), position);
            pc.math.vec3.add(this.velocity, plusMinusVector(this.velocityRange), velocity);
            pc.math.vec3.add(this.acceleration, plusMinusVector(this.accelerationRange), acceleration);
            var spinStart = this.spinStart + plusMinus(this.spinStartRange);
            var spinSpeed = this.spinSpeed + plusMinus(this.spinSpeedRange);
            var startSize = this.startSize + plusMinus(this.startSizeRange);
            var endSize = this.endSize + plusMinus(this.endSizeRange);

            for (var corner = 0; corner < 4; corner++) {
                var e = iterator.element;
                e[pc.gfx.SEMANTIC_ATTR0].set(particleVerts[corner][0], particleVerts[corner][1], lifeTime, frameStart);
                e[pc.gfx.SEMANTIC_ATTR1].set(position[0], position[1], position[2], startTime);
                e[pc.gfx.SEMANTIC_ATTR2].set(velocity[0], velocity[1], velocity[2], startSize);
                e[pc.gfx.SEMANTIC_ATTR3].set(acceleration[0], acceleration[1], acceleration[2], endSize);
                e[pc.gfx.SEMANTIC_ATTR4].set(spinStart, spinSpeed, 0.0, 0.0);
                e[pc.gfx.SEMANTIC_ATTR5].set(1, 1, 1, 1);
                iterator.next();
            }
        }
        iterator.end();

        // Create a index buffer
        var indexBuffer = new pc.gfx.IndexBuffer(graphicsDevice, pc.gfx.INDEXFORMAT_UINT16, 6 * this.numParticles);

        // Fill the index buffer
        var dst = 0;
        var indices = new Uint16Array(indexBuffer.lock());
        for (var i = 0; i < this.numParticles; i++) {
            var baseIndex = i * 4;
            indices[dst++] = baseIndex;
            indices[dst++] = baseIndex + 1;
            indices[dst++] = baseIndex + 2;
            indices[dst++] = baseIndex;
            indices[dst++] = baseIndex + 2;
            indices[dst++] = baseIndex + 3;
        }
        indexBuffer.unlock()

        var mesh = new pc.scene.Mesh();
        mesh.vertexBuffer = vertexBuffer;
        mesh.indexBuffer[0] = indexBuffer;
        mesh.primitive[0].type = pc.gfx.PrimType.TRIANGLES;
        mesh.primitive[0].base = 0;
        mesh.primitive[0].count = indexBuffer.getNumIndices();
        mesh.primitive[0].indexed = true;

        var pixels = [];
        var vals = [0, 0.2, 0.7, 1.0, 1.0, 0.7, 0.2, 0.0];
        for (var y = 0; y < 8; y++) {
            for (var x = 0; x < 8; x++) {
                var pixelComponent = vals[x] * vals[y] * 255.0;
                pixels.push(pixelComponent, pixelComponent, pixelComponent, pixelComponent);
            }
        }

        this.colorMap = _createTexture(graphicsDevice, 8, 8, pixels);
        this.rampMap = _createTexture(graphicsDevice, 2, 1, [255,255,255,255,255,255,255,0]);

        var material = new pc.scene.Material();
        material.setProgram(program);
        material.setParameter('particle_worldVelocity', this.worldVelocity);
        material.setParameter('particle_worldAcceleration', this.worldAcceleration);
        material.setParameter('particle_numFrames', this.numFrames);
        material.setParameter('particle_frameDuration', this.frameDuration);
        material.setParameter('particle_timeRange', this.timeRange);
        material.setParameter('particle_timeOffset', 0);
        material.setParameter('texture_colorMap', this.colorMap);
        material.setParameter('texture_rampMap', this.rampMap);
        material.setState({
            cull: false,
            blend: true,
            blendModes: { srcBlend: pc.gfx.BLENDMODE_SRC_ALPHA, dstBlend: pc.gfx.BLENDMODE_ONE },
            depthWrite: false
        });

        this.meshInstance = new pc.scene.MeshInstance(null, mesh, material);
        this.meshInstance.layer = pc.scene.LAYER_FX;
        this.meshInstance.updateKey();
        
        this.time = 0;
    };

    ParticleEmitter.prototype = {
        addTime: function (delta) {
            this.time += delta;
            this.meshInstance.material.setParameter('particle_time', this.time);
        },

        setColorRamp: function (pixels) {
            for (var i = 0; i < pixels.length; i++) {
                pixels[i] = Math.floor(pixels[i] * 255);
            }
            this.rampMap = _createTexture(this.graphicsDevice, pixels.length / 4, 1, pixels);
            this.meshInstance.material.setParameter('texture_rampMap', this.rampMap);
        },
        
        setColorMap: function (colorMap) {
            this.colorMap = colorMap;
            this.meshInstance.material.setParameter('texture_colorMap', this.colorMap);
        }
    };

    return {
        ParticleEmitter: ParticleEmitter
    }; 
}());
