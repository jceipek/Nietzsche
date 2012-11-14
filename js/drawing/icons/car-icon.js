var createCarIcon = function(x,y, sidelength, color){    
  var carIcon = new Kinetic.Group();
  
  var inset = sidelength/5;
  var lightInset = sidelength*0.15;
  var lightRadius = sidelength*0.05;
  var arcInset = sidelength*0.3;
  var wheelWidth = sidelength*0.15;
  var wheelInset = sidelength*0.15;
  var radius = sidelength/2;
  
  carIcon.setPosition(x,y);
  
  var carBg = new Kinetic.Rect({
       x: 0,
       y: 0,
       height: sidelength,
       width: sidelength,
       fill: color,
       cornerRadius: 5
   });
  
  var carTop = new Kinetic.Shape({
    drawFunc: function(context) {
      context.beginPath();
    
      context.moveTo(inset, sidelength/2);
      context.lineTo(inset+carBottom.getWidth()*0.2, inset);
      context.lineTo(inset+carBottom.getWidth()*0.8, inset);
      context.lineTo(inset+carBottom.getWidth(), sidelength/2);
    
      context.closePath();
      
      this.fill(context);
    },
    fill: 'white',
    x: 0,
    y: 0
  });
  
  var carWindow = new Kinetic.Shape({
    drawFunc: function(context) {
      context.beginPath();
      
      context.moveTo(arcInset, sidelength/2);
      context.lineTo(arcInset+carBottom.getWidth()*0.125, arcInset);
      context.lineTo(arcInset+carBottom.getWidth()*0.55, arcInset);
      context.lineTo(carBottom.getWidth()*0.675 + arcInset, sidelength/2);
      
      context.closePath();
      this.fill(context);
    },
    fill: color,
    x: 0,
    y: 0
  });
  
  var carBottom = new Kinetic.Rect({
    x: inset,
    y: sidelength/2,
    height: sidelength*0.5 - inset,
    width: sidelength - inset*2,
    fill: 'white',
    cornerRadius: 1
  });
  
  var lightLeft = new Kinetic.Circle({
    x: sidelength/2 + lightInset,
    y: sidelength/2 +lightInset,
    radius: lightRadius,
    fill: color
  });

  var lightRight = new Kinetic.Circle({
    x: sidelength/2 - lightInset,
    y: sidelength/2+lightInset,
    radius: lightRadius,
    fill: color
  });
  
  var wheelRight = new Kinetic.Shape({
    drawFunc: function(context) {
      context.beginPath();
      context.arc(sidelength/2 - wheelInset, sidelength-inset, wheelWidth/2, 0, Math.PI, false);
      context.closePath();
      context.fillStyle = 'white';
      context.fill();
    },
    x:0,
    y:0
  });
  
  var wheelLeft = new Kinetic.Shape({
    drawFunc: function(context) {
      context.beginPath();
      context.arc(sidelength/2 + wheelInset, sidelength-inset, wheelWidth/2, 0, Math.PI, false);
      context.closePath();
      context.fillStyle = 'white';
      context.fill();
    },
    x:0,
    y:0
  });
  
  carIcon.add(carBg); 
  carIcon.add(carBottom);
  carIcon.add(carTop);
  carIcon.add(carWindow);
  carIcon.add(lightLeft);
  carIcon.add(lightRight);
  carIcon.add(wheelLeft);
  carIcon.add(wheelRight);
  return carIcon;
  
};