        function writeMessage(messageLayer, message) {
        var context = messageLayer.getContext();
        messageLayer.clear();
        context.font = '18pt Calibri';
        context.fillStyle = 'black';
        context.fillText(message, 10, 25);
      }

      function initStage() {
        var stage = new Kinetic.Stage({
          container: 'screen1Container',
          width: 578,
          height: 200
        });

        var shapesLayer = new Kinetic.Layer();
        var messageLayer = new Kinetic.Layer();

	var rect = new Kinetic.Rect({
          x: 239,
          y: 75,
          width: 100,
          height: 50,
	fill: 'green',
	  align:"center",
          stroke: 'black',
          strokeWidth: 4
        });

	shapesLayer.add(rect);
        stage.add(shapesLayer);
        stage.add(messageLayer);

	$('#to-field').keyup(function(){
		console.log($('#to-field').val());
		//if($('#to-field').val())
	});
      }

      $(function() {
        initStage();
});
