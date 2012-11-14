define(function () {

  var createTIcon = function (x, y, sidelength) {
   var tIcon = new Kinetic.Group();
   var radius = sidelength/2;
   var insetSide = sidelength*0.13;
   var insetTop = sidelength*0.21;
   var thickness = sidelength*0.0363;

   tIcon.setPosition(x,y);

  var verticalRect = new Kinetic.Rect({
    x: sidelength*0.5 - sidelength*0.173/2 + thickness/2,
    y: sidelength*0.5 - insetTop + thickness*2,
    height: sidelength*0.5,
    width: sidelength*0.173,
    fill: 'black'
  });

  var horizontalRect = new Kinetic.Rect({
    x: insetSide+thickness/2,
    y: insetTop+thickness*2,
          //x: insetSide + thickness/2,
          //y: insetTop + thickness/2,
          height: sidelength*0.173,
          width: sidelength*0.736,
          fill: 'black'
  });

   var tIconCircle = new Kinetic.Circle({
     x: radius,
     y: radius,
     radius: radius,
     stroke: 'black',
     strokeWidth: thickness
   });

   tIcon.add(tIconCircle);
   tIcon.add(horizontalRect);
   tIcon.add(verticalRect);

   return tIcon; 
  };

  return createTIcon;
});