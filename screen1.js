$(function() {

  var screen1 = {
    stage: new Kinetic.Stage({
            container: 'screen1Container',
            width: 640,
            height: 940}),
    shapesLayer: new Kinetic.Layer()
    //messageLayer: new Kinetic.Layer()
  };
  screen1.stage.add(screen1.shapesLayer);

  var createRouteItem = function (layer) {
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
    layer.add(rect);
  };

  $('#to-field').keyup(function(){
          console.log($('#to-field').val());
          //if($('#to-field').val())
          createRouteItem(screen1.shapesLayer);
          screen1.shapesLayer.draw();
  });

});
