pc.script.create('shapesGUI', function (context) {

    var shapeiconcss = 
        //
        // ZOMG I need to learn css so that this doesn't look so awful
        //

        ".shapeiconframe { display:inline-block; position:relative; pointer-events:none; margin: 0px; "+
            "height: 150px; width: 150px; border: 5px solid green; border-radius: 10px; background: green; } " +

        ".shapeiconframe div { position:absolute; top:50%; left:50%; margin-left:-65px; margin-top:-65px; pointer-events:none; text-align:center; color:white; width:130px; height:130px; border: 0px; background-size:130px;} " +

        ".shapeiconcontainer { pointer-events:none; position: absolute; left:0px; bottom:0px; width:50%; height:170px; border:0px; background:transparent; }" +

        ".basicbutton { width:150px; height:80px; border: 8px solid blue; background: blue; color:white; font-size:large;77}" +
        ".fitimage { width:60%; }" +
        ".restartbutton { position:absolute; bottom:20%; left:0; right:0; margin:auto;}";

    var ShapesGUI = function (entity) {
        this.entity = entity;
        this.maxgesturevalue = 100;
        this.currentgesturevalue = 100;
        this.combatactors = {};
        this.context = context;
        this.container = document.getElementById('application-container');
    };

    ShapesGUI.prototype = {
        initialize: function () {
            // Install the UI styles
            var style = document.createElement('style');
            style.innerHTML = shapeiconcss;
            document.getElementsByTagName("head")[0].appendChild(style);
            pc.log.write("ShapesGUI added css");

            //
            // one element holds all the shape icons
            //

            this.shapeiconcontainer = document.createElement('div');
            this.shapeiconcontainer.className = "shapeiconcontainer";
            this.container.appendChild(this.shapeiconcontainer);
        },

        update: function(dt) {

        },

        addShapeIcon: function (shapedata) {
            var shapeiconframe = document.createElement('div');
            shapeiconframe.className = 'shapeiconframe';

            var shapeiconbox = document.createElement('div');
            //shapeiconbox.className = 'shapeiconbox';
            shapeiconframe.appendChild(shapeiconbox);

            // first find the image we need
            var imagename = shapedata.iconname;
            var allassetdata = context.assets.all();
            var nametoasset = function (findname) { return _.find(allassetdata, function(d) { return d.name === findname; })};
            var imageasset = nametoasset(imagename);
            var imageURL = imageasset.getFileUrl();

            shapeiconbox.style.backgroundImage = 'url('+imageURL+')';
            shapeiconbox.innerHTML = '<p>' + shapedata.shapename + '</p>';

            this.shapeiconcontainer.appendChild(shapeiconframe);
        }
    };

    return ShapesGUI;
});