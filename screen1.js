function writeMessage(messageLayer, message) {
        var context = messageLayer.getContext();
        messageLayer.clear();
        context.font = "18pt Calibri";
        context.fillStyle = "black";
        context.fillText(message, 10, 25);
      }

      $(function() {
        var stage = new Kinetic.Stage({
          container: "screen1Container",
          width: 578,
          height: 200
        });
        var circleLayer = new Kinetic.Layer();
        var messageLayer = new Kinetic.Layer();

        var numEvents = 0;

        var circle = new Kinetic.Circle({
          x: stage.getWidth() / 2,
          y: stage.getHeight() / 2 + 10,
          radius: 70,
          fill: "red",
          stroke: "black",
          strokeWidth: 4
        });

        circle.on("mouseover mousedown mouseup", function() {
          writeMessage(messageLayer, "Multi-event binding!  Events: " + (++numEvents));
        });
        circle.on("mouseout", function() {
          writeMessage(messageLayer, "");
        });

        circleLayer.add(circle);

        stage.add(circleLayer);
        stage.add(messageLayer);
      });

