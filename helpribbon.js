pc.script.create('helpribbon', function (context) {

    var helpribboncss = 
        //
        // ZOMG I need to learn css so that this doesn't look so awful
        //

        ".helpribbon { position:absolute; pointer-events:none; margin: auto; "+
            "height: 150px; width: 80%; border: 0px; top:50px; left:0px; right:0px; color:white; text-align:center; } ";

    var helpmessages = [
        "Use the arrow keys to move",
        "Complete the maze by reaching the green sparkles",
        "When you collect animals shapes use Q/W/E to shapeshift",
        "Rocks are heavy and must be pushed by someone strong",
        "The floating head guardian blocks the way if it sees you",
        "The leopard can sneak unseen in high grass"
    ];

    var HelpRibbon = function (entity) {
        this.entity = entity;
        this.context = context;
        this.container = document.getElementById('application-container');
        this.timeuntilnextmessage = 0;
        this.currentmessageindex = 0;
        this.timebetweenmessages = 5;
    };

    HelpRibbon.prototype = {
        initialize: function () {
            // Install the UI styles
            var style = document.createElement('style');
            style.innerHTML = helpribboncss;

            document.getElementsByTagName("head")[0].appendChild(style);
            pc.log.write("HelpRibbon added css");

            this.helpribbon = document.createElement('div');
            this.helpribbon.className = "helpribbon";
            this.container.appendChild(this.helpribbon);

            this.setMessage(helpmessages[0]);
        },

        update: function(dt) {
            if (this.timeuntilnextmessage < 0 ) {
                this.currentmessageindex = (this.currentmessageindex + 1) % helpmessages.length;
                this.setMessage(helpmessages[this.currentmessageindex]);
                this.timeuntilnextmessage = this.timebetweenmessages;
            } else {
                this.timeuntilnextmessage -= dt;
            }
        },

        setMessage: function(message) {
            this.helpribbon.innerHTML = message;
        }
    };

    return HelpRibbon;
});