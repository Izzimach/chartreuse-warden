
pc.script.create("mazeexit", function (context) {
 
    var mazeexitcss = 
        ".finishedframe { position: absolute; top: 40%; left:0; right:0; margin-left:auto; margin-right:auto; "+
            "height: 300px; width: 500px; border: 8px solid #8f8; border-radius: 10px; background: #8f8; } " +

        ".finishedbox { margin:0; background: black; width:100%; height:100%; border: 0px; border-radius: 5px; text-align:center; "+
            " font-size:xx-large; color:white; transform: scale(2,2); } " +

        ".restartbutton { position:absolute; width:150px; font-size:large; bottom:20%; left:0; right:0; margin:auto; color:#aaa; background: black; text-align:center; border: 1px solid white;}" +
        ".restartbutton:hover { border:4px solid green; font-weight:bold; color:white; background: #242; };";



    var MazeExit = function (entity) {
        this.entity = entity;
        this.rotationangle = 0;
        this.rotationspeed = 90; // degrees/second
        this.didinitialupdate = false;

        this.context = context;
        this.container = document.getElementById('application-container');

        var style = document.createElement('style');
        style.innerHTML = mazeexitcss;
        document.getElementsByTagName("head")[0].appendChild(style);
        console.log("MazeExit: added css");
    };
 
    MazeExit.prototype = {
        initialize: function () {

            this.entity.collision.on('triggerenter', _.bindKey(this, 'exitcollide'));
            this.entity.collision.on('triggerleave', _.bindKey(this, 'exitleave'));
            this.didinitialupdate = false;
        },

        update: function (dt) {
            if (!this.didinitialupdate) {
                this.initialUpdate(dt);
            }

            if (this.entity.getParent() === null) { return; } // just got destroyed

            this.rotationangle += (this.rotationspeed * dt);
            this.entity.setLocalEulerAngles(0,this.rotationangle,0);
        },

        initialUpdate: function(dt) {
            this.didinitialupdate = true;
        },

        exitcollide: function (otherentity) {
            if (_.isUndefined(otherentity.script)) { // no scripts! must be a tree or ground
                return;
            }
            
            var shapeshifter = otherentity.script.shapeshifter;
            if (!_.isUndefined(shapeshifter)) {
                // maze complete!

                // turn off avatar control
                //otherentity.script.avatarmovement.movementenabled = false;
                //shapeshifter.shapeshiftingenabled = false;

                var finishedframe = document.createElement('div');
                finishedframe.className = 'finishedframe';

                var finishedbox = document.createElement('div');
                finishedbox.className = 'finishedbox';
                finishedbox.innerHTML = 'Completed!<br>';

                var replaybutton = document.createElement('input');
                replaybutton.type = 'button';
                replaybutton.className = 'restartbutton';
                replaybutton.value = 'Reload';
                replaybutton.onclick = _.bindKey(this,'restartGame');
                finishedbox.appendChild(replaybutton);

                finishedframe.appendChild(finishedbox);

                this.container.appendChild(finishedframe);
            }
        },

        exitleave: function (otherentity) {
        },

        restartGame: function() {
            location.reload();
        }
    };
    
    return MazeExit;
});
