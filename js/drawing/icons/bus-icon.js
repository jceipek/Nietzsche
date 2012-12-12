define(function () {

  var createBusIcon = function(x,y, sidelength, color, number){
    var busIcon = new Kinetic.Group();
    
    var inset = sidelength/5;
    var lightInset = sidelength*0.15;
    var lightRadius = sidelength*0.05;
    var arcInset = sidelength*0.3;
    var wheelWidth = sidelength*0.15;
    var wheelInset = sidelength*0.15;
    var radius = sidelength/2;
    
    busIcon.setPosition(x,y);
    
    var busNumber = new Kinetic.Text({
        x: 0,
        y: sidelength,
        text: number,
        fontSize: 15,
        fontFamily: "Calibri",
        align: 'center',
        textFill: "white",
        padding: inset
     });
     
    var iconbg = new Kinetic.Rect({
      x: 0,
      y: 0,
      height: sidelength*2-inset,
      width: busNumber.getWidth(),
      fill: color,
      cornerRadius: 5
     });
     
    var busBg = new Kinetic.Rect({
      x: (busNumber.getWidth() - (sidelength-inset*2))/2,
      y: inset,
      height: sidelength-inset*2,
      width: sidelength-inset*2,
      fill: 'white',
      cornerRadius: 2, 
    });

    var busWindow = new Kinetic.Rect({
      x: busNumber.getWidth()/2 - (sidelength - inset*3)/2,
      y: sidelength/4,
      height: sidelength*0.45 - inset,
      width: sidelength - inset*3,
      fill: color,
      cornerRadius: 2
    });
    
    var lightLeft = new Kinetic.Circle({
      x: busNumber.getWidth()/2 - busBg.getWidth()/2 + lightInset,
      y: sidelength/2+lightInset,
      radius: lightRadius,
      fill: color
    });

    var lightRight = new Kinetic.Circle({
      x: busNumber.getWidth()/2 + busBg.getWidth()/2 - lightInset,
      y: sidelength/2+lightInset,
      radius: lightRadius,
      fill: color
    });
    
    var wheelRight = new Kinetic.Shape({
      drawFunc: function(context) {
      context.beginPath();
      context.arc(busNumber.getWidth()/2 + busBg.getWidth()/2 - wheelInset, sidelength-inset, wheelWidth/2, 0, Math.PI, false);
      context.closePath();
      context.fillStyle = 'white';
      context.fill();
    }
    });
    
    var wheelLeft = new Kinetic.Shape({
      drawFunc: function(context) {
      context.beginPath();
      context.arc(busNumber.getWidth()/2 - busBg.getWidth()/2 + wheelInset, sidelength-inset, wheelWidth/2, 0, Math.PI, false);
      context.closePath();
      context.fillStyle = 'white';
      context.fill();
    }
    });
    
    busIcon.add(iconbg);
    busIcon.add(busBg);
    busIcon.add(busWindow);
    busIcon.add(lightLeft);
    busIcon.add(lightRight);
    busIcon.add(wheelLeft);
    busIcon.add(wheelRight);
    busIcon.add(busNumber);
    return busIcon;
    
  };

  return createBusIcon;
});