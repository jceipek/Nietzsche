 //This is what we're typing into
 var createRouteHeader = function (y, width, height, headerTitle) {
  var group = new Kinetic.Group();
  var routeHeader = new Kinetic.Text({
    x: 0,
    y: y,
    text: headerTitle,
    fontSize: 20,
    fontFamily: 'HelveticaNeue-Light',
    textFill: '#FFF',
    width: width,
    padding: 10,
    align: 'left',
  });

  var background = new Kinetic.Rect({
    x: 0,
    y: y,
    width: width,
    height: height,
    fill: {
      start: {
        x: 0,
        y: -50
      },
      end: {
        x: 0,
        y: 50
      },
      colorStops: [0, '#333', 1, '#555']
    },
    stroke: '#555',
    strokeWidth: 4
  });

  group.add(background);
  group.add(routeHeader);

  return group;
};

//This is the background for each graphical line
var createRouteItem = function (y, width, height, route) {
  var group = new Kinetic.Group();
  var background = new Kinetic.Rect({
    name: 'background',
    x: 0,
    y: 0,
    width: width,
    height: height,
    fill: 'white',
    stroke: 'grey',
    strokeWidth: 4
  });

  var nickname = new Kinetic.Text({
    name: 'text',
    x: 0,
    y: 0,
    text: route.nickname,
    fontSize: 24,
    fontFamily: 'HelveticaNeue-Medium',
    textFill: '#000',
    attrs: {
      swapTextFill: '#fff'
    },
    width: width,
    padding: 20,
    align: 'left'
  });

  var routeDetails = new Kinetic.Text({
    name: 'text',
    x: 0,
    y: 40,
    text: route.name + "\n" + route.address +"\n" + route.location,
    fontSize: 20,
    fontFamily: 'HelveticaNeue',
    textFill: '#555',
    attrs: {
      swapTextFill: '#fff'
    },
    width: width,
    padding: 20,
    align: 'left',
  });

  group.setPosition(0, y);
  group.setWidth(width);
  group.setHeight(height);
  group.add(background);
  group.add(nickname);
  group.add(routeDetails);
  return group;
};
  //and this is the actual colored line segment
  var createStepLine = function (xStart, xEnd, yMid, thickness, color, startRounded, endRounded) {
    var radius = thickness/2;
    var stepShape = new Kinetic.Shape({
      drawFunc: function(context) {

        context.beginPath();
        if(startRounded){
          context.arc(xStart+radius, yMid, radius, Math.PI/2, -Math.PI/2, false);
        }
        else{
          context.moveTo(xStart, yMid+radius);
          context.lineTo(xStart, yMid-radius);
        }
        if(endRounded){
          context.arc(xEnd-radius, yMid, radius, -Math.PI/2, Math.PI/2, false);
        }
        else{
          context.lineTo(xEnd, yMid-radius);
        }
        context.lineTo(xEnd, yMid+radius);
        
        context.closePath();
        
        this.fill(context);
      },
      fill: color
    });
    return stepShape;
  };
  //this makes the icon backgrounds for each segment
  var createRoundedIconBg = function (x, y, sideLength, color) {
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
  }


//TODO: Make the Hidden Bubbles use the width of the canvas, to allow for scrolling
//This is the time flag
var createMessageBubble = function (anchorX, anchorY, height, color, text) {
  var offset = 0;
  var l = height;
  var bubbleGroup = new Kinetic.Group();
    var textInset = 0.125 * height;
  var bubbleText = new Kinetic.Text({
    x: 0,
    y: 0,
    text: text,
    fontSize: 18,
    fontFamily: "HelveticaNeue-Medium",
    textFill: "white",
    padding: textInset,
    align: "left"
  });
  var textwidth = bubbleText.getWidth();
  var bg = new Kinetic.Shape({
    drawFunc: function (ctx) {
      ctx.beginPath();
      ctx.moveTo(textwidth, l); //point of the triangle
      ctx.lineTo(textwidth, .422*l); //top connection of triangle
      ctx.arc(textwidth -.11*l, .11*l, .11*l, 0, 1.5*Math.PI, true); //top right arc
      ctx.arc(.11*l, .11*l, .11*l, 1.5*Math.PI, Math.PI, true); //top left arc
      ctx.arc(.11*l, .577*l, .11*l, Math.PI, 0.5*Math.PI, true); //bottom left arc
      ctx.lineTo(textwidth-.11*l, .688*l); //lower connector to triangle
      ctx.lineTo(textwidth, l); //back to anchor point
      ctx.lineWidth = 1;
      ctx.closePath();
      this.fill(ctx);        
    },
    fill: color
  });

  bubbleGroup.add(bg);
  bubbleGroup.add(bubbleText);
  bubbleGroup.setPosition(anchorX - textwidth, anchorY - height * 2);
  return bubbleGroup;
};
//Time flag when start point is too close too screen to display time
var createHiddenStartMessageBubble = function (anchorX, anchorY, height, color, text) {
  var offset = 0;
  var l = height;
  var bubbleGroup = new Kinetic.Group();
    var textInset = 0.125 * height;
  var bubbleText = new Kinetic.Text({
    x: 0,
    y: 0,
    text: text,
    fontSize: 18,
    fontFamily: "HelveticaNeue-Medium",
    textFill: "white",
    padding: textInset,
    align: "left"
  });
  var textwidth = bubbleText.getWidth();
  var bg = new Kinetic.Shape({
    drawFunc: function (ctx) {
      ctx.beginPath();
      ctx.moveTo(anchorX, l); //point of the triangle
      ctx.lineTo(textwidth-.11*l, .687*l); //top connection of triangle
      ctx.arc(textwidth-.11*l, .577*l, .11*l, 0.5*Math.PI, 0, true); //bottom right arc
      ctx.arc(textwidth -.11*l, .11*l, .11*l, 0, 1.5*Math.PI, true); //top right arc
      ctx.arc(.11*l, .11*l, .11*l, 1.5*Math.PI, Math.PI, true); //top left arc
      ctx.arc(.11*l, .577*l, .11*l, Math.PI, 0.5*Math.PI, true); //bottom left arc
      ctx.lineTo(anchorX, .687*l); //lower connector to triangle
      ctx.lineTo(anchorX, l); //back to anchor point
      ctx.lineWidth = 1;
      ctx.closePath();
      this.fill(ctx);        
    },
    fill: color
  });

  bubbleGroup.add(bg);
  bubbleGroup.add(bubbleText);
  bubbleGroup.setPosition(0, anchorY - height * 2);
  return bubbleGroup;
};
//Time flag when end point is off the screen
var createHiddenEndMessageBubble = function (anchorX, anchorY, height, color, text) {
  var offset = 0;
  var l = height;
  var bubbleGroup = new Kinetic.Group();
    var textInset = 0.125 * height;
  var bubbleText = new Kinetic.Text({
    x: 465,
    y: 0,
    text: text,
    fontSize: 18,
    fontFamily: "HelveticaNeue-Medium",
    textFill: "white",
    padding: textInset,
    align: "left"
  });
  var textwidth = bubbleText.getWidth();
  var bg = new Kinetic.Shape({
    drawFunc: function (ctx) {
      ctx.beginPath();
      ctx.moveTo(anchorX, l); //point of the triangle
      ctx.lineTo(552, .422*l); //top connection of triangle
      ctx.arc(552 -.11*l, .11*l, .11*l, 0, 1.5*Math.PI, true); //top right arc
      ctx.arc(465+.11*l, .11*l, .11*l, 1.5*Math.PI, Math.PI, true); //top left arc
      ctx.arc(465+.11*l, .577*l, .11*l, Math.PI, 0.5*Math.PI, true); //bottom left arc
      ctx.lineTo(552-.11*l, .688*l); //lower connector to triangle
      ctx.lineTo(anchorX, l); //back to anchor point
      ctx.lineWidth = 1;
      ctx.closePath();
      this.fill(ctx);        
    },
    fill: color
  });

  bubbleGroup.add(bg);
  bubbleGroup.add(bubbleText);
  bubbleGroup.setPosition(0, anchorY - height * 2);
  return bubbleGroup;
};
//This is the button that transitions from Screen 2 to Screen 3
var createGraphicalRouteButton = function (x, y, width, height, direction) {
  var color = "#999999";
  var strokewidth = 3;
  var buttonGroup = new Kinetic.Group();
  var selectionButton = new Kinetic.Rect({
    x: x,
    y: y+strokewidth,
    width: width+15,
    height: height-strokewidth*2,
    fill: '#777777',
    strokeWidth: strokewidth,
    stroke: "#424242",
    cornerRadius: 20,
  });
  var selectionButtonGrabLeft = new Kinetic.Line({
    points: [x+width/4, y+0.1*height, x+width/4, y+0.9*height],
    stroke: color,
    strokeWidth: 8,
    lineCap: "round",
  });
   var selectionButtonGrabRight = new Kinetic.Line({
    points: [x+2*width/4, y+0.1*height, x+2*width/4, y+0.9*height],
    stroke: color,
    strokeWidth: 8,
    lineCap: "round",
  });
    var selectionButtonGrabMiddle = new Kinetic.Line({
    points: [x+3*width/4, y+0.1*height, x+3*width/4, y+0.9*height],
    stroke: color,
    strokeWidth: 8,
    lineCap: "round",
  });

  buttonGroup.add(selectionButton);
  buttonGroup.add(selectionButtonGrabMiddle);
  buttonGroup.add(selectionButtonGrabRight);
  buttonGroup.add(selectionButtonGrabLeft);
  return buttonGroup;
};

var createGraphicalTimeBar = function (width, height, barStartTime, barEndTime, scaleFactor) {
  var timeBarGroup = new Kinetic.Group();
  var bar = new Kinetic.Rect({
    x: 0,
    y: 0,
    width: width,
    height: height,
    fill: 'black'
  });
  timeBarGroup.add(bar);
  return timeBarGroup;  
}

var createArrivalBar = function (width, height, y, timeString) {
  var textInset = height*0.25;
  var arrivalBarGroup = new Kinetic.Group();
  arrivalBarGroup.setPosition(0,y);
  console.log("LOCATION: "+y);
  var background = new Kinetic.Rect({
    x: 0,
    y: 0,
    width: width,
    height: height,
    fill: 'black',
    stroke: 'white',
    strokeWidth: 2
  });
  var arrivalText = "Estimated Arrival Time: "+timeString;
  var text = new Kinetic.Text({
    x: 0,
    y: 0,
    text: arrivalText,
    fontSize: 18,
    fontFamily: "HelveticaNeue-Medium",
    textFill: "white",
    padding: textInset,
    align: "left"
  });
  arrivalBarGroup.add(background);
  arrivalBarGroup.add(text);
  return arrivalBarGroup;
}

var createDirectionWaitItem = function (y, width, height, msWaitTime) {
  var textInset = height*0.25;
  var waitGroup = new Kinetic.Group();
  waitGroup.setPosition(0,y);
  var background = new Kinetic.Rect({
    x: 0,
    y: 0,
    width: width,
    height: height,
    fill: 'black',
    stroke: 'white',
    strokeWidth: 2
  });
  var waitText = "(" + millisecondsToHumanString(msWaitTime) + ")";
  var text = new Kinetic.Text({
    x: 0,
    y: 0,
    text: waitText,
    fontSize: 18,
    fontFamily: "HelveticaNeue-Medium",
    textFill: "white",
    padding: textInset,
    align: "left"
  });
  waitGroup.add(background);
  waitGroup.add(text);
  return waitGroup;
}

var createDirectionStepItem = function (y, width, height, step) {

  var stepGroup = new Kinetic.Group();
  stepGroup.setPosition(0,y);
  var background = new Kinetic.Rect({
    x: 0,
    y: 0,
    width: width,
    height: height,
    fill: 'red',
    stroke: 'black',
    strokeWidth: 2
  });

  stepGroup.add(background);

  return stepGroup;
}
