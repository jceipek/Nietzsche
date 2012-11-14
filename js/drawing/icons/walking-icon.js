define(function () {
  //this makes the icon backgrounds for each segment
  createRoundedIconBg = function (x, y, sideLength, color) {
   var iconbg = new Kinetic.Rect({
     x: x,
     y: y,
     height: sideLength,
     width: sideLength,
     fill: color,
     cornerRadius: 5
   });
   return iconbg;
  };

  var createWalkingIcon = function (x, y, sideLength, color) {
      var inset = sideLength/5;
      var walkingIcon = new Kinetic.Group();
      var iconBg = createRoundedIconBg(x, y, sideLength, color);
      var person = new Kinetic.Shape({
          drawFunc: function(context) {
            context.beginPath();
            //head+body
            context.moveTo(x+(0.588*sideLength),y+(0.0588*sideLength)+(inset/4));
            context.lineTo(x+(0.471*sideLength),y+(0.3125*sideLength)-(inset/2));
            context.lineTo(x+(0.471*sideLength),y+(0.588*sideLength)-(inset/2));
            //legs
            context.moveTo(x+(0.235*sideLength),y+(0.941*sideLength)-(inset/4));
            context.lineTo(x+(0.471*sideLength),y+(0.588*sideLength)-(inset/4));
            context.lineTo(x+(0.706*sideLength),y+(0.765*sideLength)-(inset/4));
            context.lineTo(x+(0.706*sideLength),y+(0.941*sideLength)-(inset/4));
  	  //arms
            context.moveTo(x+(0.235*sideLength),y+(0.412*sideLength)+(inset/4));
            context.lineTo(x+(0.412*sideLength)+(inset/4),y+(0.235*sideLength)+(inset/4));
            context.lineTo(x+(0.706*sideLength),y+(0.412*sideLength)+(inset/4));
            //context.closePath();
            context.lineCap = 'round';
            this.stroke(context);
          },
          stroke: 'white',
          strokeWidth: .118*sideLength,
          lineJoin: 'round',
          });
      walkingIcon.add(iconBg);
      walkingIcon.add(person);
      return walkingIcon;
  };

  return createWalkingIcon;
});