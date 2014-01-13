pc.script.create("avatarmovement", function (context) {
 
    var AvatarMovement = function (entity) {
        this.entity = entity;
        this.movespeed = 1;
        this.ismoving = false;
    };
 
    AvatarMovement.prototype = {
        initialize: function () {
        },
 
        update: function (dt) {
            var dx = 0;
            var dy = 0;
            var jump = false;
            if (context.keyboard.isPressed(pc.input.KEY_LEFT)) {
                dx = dx - 1;
            }
            if (context.keyboard.isPressed(pc.input.KEY_RIGHT)) {
                dx = dx + 1;
            } 
            if (context.keyboard.isPressed(pc.input.KEY_UP)) {
                dy = dy - 1;
            } 
            if (context.keyboard.isPressed(pc.input.KEY_DOWN)) {
                dy = dy + 1;
            } 
 
            /*
             * Notice that pressing and holding the space bar makes the block 
             * continuously spin. isPressed() is used to detected if a
             * key is down right now. So it will be true every frame as long as 
             * the key is still pressed.
             */
            if (context.keyboard.isPressed(pc.input.KEY_SPACE)) {
                jump = true;
            }

            var p = this.entity.getPosition();
            this.entity.setPosition(p[0] + dx * dt * this.movespeed, p[1], p[2] + dy * dt * this.movespeed);

            // update facing based on movement direction
            this.ismoving = (dx !== 0 || dy !== 0);
            if (this.ismoving) {
                var angle = Math.atan2(-dy,dx) * 180.0/Math.PI;
                this.entity.setLocalEulerAngles(0,angle+90,0);
            }

        },

        getComponentReference: function() {
            return this;
        },
 
        /*
        * Event handler called when key is pressed
        */
        onKeyDown: function (event) {
            // Check event.key to detect which key has been pressed
            if (event.key === pc.input.KEY_A) {
                this.entity.primitive.color = new pc.Color(1,0,0);
            }
 
            // When the space bar is pressed this scrolls the window.
            // Calling preventDefault() on the original browser event stops this.
            event.event.preventDefault();
 
        },
 
        /*
        * Event handler called when key is released
        */
        onKeyUp: function (event) {
            // Check event.key to detect which key has been pressed
            if (event.key === pc.input.KEY_A) {
                this.entity.primitive.color = new pc.Color(1,1,1);
            }
        }
    };
    
    return AvatarMovement;
});
