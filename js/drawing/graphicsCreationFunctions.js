define(["drawing/icons/bus-icon", 
        "drawing/icons/car-icon",
        "drawing/icons/t-icon",
        "drawing/icons/walking-icon"],
  function (busicon, caricon, ticon, walkingicon) {

    var DrawFns = {
      createBusIcon: busicon,
      createCarIcon: caricon,
      createTIcon: ticon,
      createWalkingIcon: walkingicon
    };


    //This is what we're typing into
    DrawFns.createRouteHeader = function (y, width, height, headerTitle) {
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
  DrawFns.createRouteItem = function (y, width, height, route) {
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
  DrawFns.createStepLine = function (xStart, xEnd, yMid, thickness, color, startRounded, endRounded) {
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
    return stepShape
  };

  //TODO: Make the Hidden Bubbles use the width of the canvas, to allow for scrolling
  //This is the time flag
  DrawFns.createMessageBubble = function (anchorX, anchorY, height, color, text) {
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
  DrawFns.createHiddenStartMessageBubble = function (anchorX, anchorY, height, color, text) {
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
  DrawFns.createHiddenEndMessageBubble = function (anchorX, anchorY, height, color, text) {
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
  DrawFns.createHiddenMiddleBubble = function (anchorX, anchorY, height, color, text) {
    var l = height;
    var bubbleGroup = new Kinetic.Group();
      var textInset = 0.125 * height;
    var bubbleText = new Kinetic.Text({
      x: 376,
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
        ctx.lineTo(465, .422*l); //top connection of triangle
        ctx.arc(465 -.11*l, .11*l, .11*l, 0, 1.5*Math.PI, true); //top right arc
        ctx.arc(376+.11*l, .11*l, .11*l, 1.5*Math.PI, Math.PI, true); //top left arc
        ctx.arc(376+.11*l, .577*l, .11*l, Math.PI, 0.5*Math.PI, true); //bottom left arc
        ctx.lineTo(465-.11*l, .688*l); //lower connector to triangle
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
  DrawFns.createGraphicalRouteButton = function (x, y, width, height, direction) {
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

  DrawFns.createGraphicalTimeBar = function (width, height, barStartTime, barEndTime, scalingFactor) {
    var timeBarGroup = new Kinetic.Group();
    var bg = new Kinetic.Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: "black"
    });
    /*
    var startTime = new Kinetic.Text({
      text: barStartTime,
      textFill: "white",
      padding: 16,
      fontSize: 18
    });
    var endTime = new Kinetic.Text({
       text: barEndTime,
       textFill: "white",
       padding: 16,
       fontSize: 18,
       align: "right",
       offset: [-530,0]
    });*/

    timeBarGroup.add(bg);
    
    var currTime = new Date(barStartTime);

    var divCount = ((barEndTime - currTime)/1000/60/5);
    //console.log("Div Count: " + divCount);

    while (currTime < barEndTime) {
      var timeTxt = formatTime(currTime);
      /*console.log("WHAT START: ");
      console.log(barStartTime);
      console.log("WHAT END: ");
      console.log(barEndTime);
      console.log("NEW TIME ITEM: " + timeTxt);*/
      //console.log(posFromTime(currTime, barStartTime, scalingFactor));


      var timeItem = new Kinetic.Text({
        x: posFromTime(currTime, barStartTime, scalingFactor), // XXX: THIS FUNCTION IS NOT CALLED CORRECTLY. TIMES WILL BE OFFSET A BIT
        y: 2,
        text: timeTxt,
        textFill: 'white',
        padding: 0,
        fontSize: 15,
        fontFamily: "HelveticaNeue-Medium"
      });
      timeBarGroup.add(timeItem);
      currTime.setMinutes(currTime.getMinutes()+15);
    }

    return timeBarGroup;  
  }

  /*var Comparison = {
      ctx: null, // The graphical comparison canvas
      initialTime: null, // Departure time
      scalingFactor: 0.2, // How many seconds one pixel on the canvas represents
      width: $(window).width(), // Width of the canvas. Starts at width of window.
      height: $(window).height(), // Width of the canvas. Starts at width of window.
      horizontalRouteOffset: 70
    };*/

  DrawFns.drawTenMinuteIntervalLines = function(startX, startY, endYTime) {
    var tenMinOffset; //how many px is ten minutes?
    var endYPos = posFromTime(endYTime);
    for (var i = 0; i < endYPos; i+tenMinOffset) {
      var tenMinLines = new Kinetic.Line({
        points: [startX, startY, startX, i],
        stroke: "black",
        strokeWidth: 8
      });
    return tenMinLines;
    }
  }

  DrawFns.drawFiveMinuteIntervalLines = function(startX, startY, endYTime) {
    var fiveMinOffset; //how many px is five minutes?
    var endYPos = posFromTime(endYTime);
    for (var i = 0; i < endYPos; i+fiveMinOffset) {
      var fiveMinLines = new Kinetic.Line({
        points: [startX, startY, startX, i],
        stroke: "rgb(200, 200, 200)",
        strokeWidth: 4
      });
    return fiveMinLines;
    }
  };

  /*var plotTimeIntervals = function (currTime, initialTime, scalingFactor) {
      var initialIntervalTime = new Date(initialTime.value);
      var currIntervalPos = new Date(currTime.value);
      initialIntervalTime.setMinutes(0);
      if ((initialIntervalTime.getMinutes() % 10) === 0) {
          //addTime(initialIntervalTime,
            //      currIntervalPos+4,
              //    15); // The canvas version
          drawTenMinuteIntervalLines(currIntervalPos, 0);
      } else if ((initialIntervalTime.getMinutes() % 5) === 0) {
           drawFiveMinuteIntervalLines(currIntervalPos, 15);
      }
    };*/

  /**
  var plotTimeIntervals = function () {
      var currIntervalTime = new Date(Comparison.initialTime);
      currIntervalTime.setMinutes(0);
      var ctx = Comparison.ctx;
      while (posFromTime(currIntervalTime) < Comparison.width) {
        currIntervalPos = posFromTime(currIntervalTime);
        var startY = 0;
        ctx.beginPath();
        if ((currIntervalTime.getMinutes() % 10) === 0) {
          addTime(currIntervalTime,
                  currIntervalPos+4,
                  15); // The canvas version
          ctx.strokeStyle = "rgb(0, 0, 0)";
        } else if ((currIntervalTime.getMinutes() % 5) === 0) {
          ctx.strokeStyle = "rgb(200, 200, 200)";
          startY = 15;
        }
        ctx.moveTo(currIntervalPos, startY);
        ctx.lineTo(currIntervalPos, document.height);
        ctx.stroke();
        currIntervalTime.setMinutes(currIntervalTime.getMinutes()+5);
      }
    };
    **/

  DrawFns.createSideBar = function (width, height, y, steps) {
    var sideBarGroup = new Kinetic.Group();
    sideBarGroup.setPosition({x: 0, y: y});
    var background = new Kinetic.Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: 'yellow',
      stroke: 'black',
      strokeWidth: 2
    });
    sideBarGroup.add(background);
    return sideBarGroup
  };

  DrawFns.createArrivalBar = function (width, height, y, timeString) {
    var textInset = height*0.25;
    var arrivalBarGroup = new Kinetic.Group();
    arrivalBarGroup.setPosition(0,y);
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
  };

  DrawFns.createDirectionWaitItem = function (y, width, height, msWaitTime) {
    var textInset = height*0.25;
    var waitGroup = new Kinetic.Group();
    waitGroup.setPosition(0,y);
    var background = new Kinetic.Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: WAIT_ITEM_BG_COLOR,
      stroke: WAIT_ITEM_BORDER_COLOR,
      strokeWidth: 2
    });
    var waitText = "wait " + millisecondsToHumanString(msWaitTime);
    var text = new Kinetic.Text({
      x: 0,
      y: 0,
      text: waitText,
      fontSize: 18,
      fontFamily: "HelveticaNeue-Medium",
      textFill: WAIT_ITEM_TEXT_COLOR,
      padding: textInset,
      align: "left"
    });
    waitGroup.add(background);
    waitGroup.add(text);
    return waitGroup;
  };

  DrawFns.createDirectionStepItem = function (y, width, height, pathBlockWidth, step) {

    var stepGroup = new Kinetic.Group();
    stepGroup.setPosition(0,y);
    var background = new Kinetic.Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: DIRECTION_STEP_ITEM_BG_COLOR,
      stroke: DIRECTION_STEP_ITEM_BORDER_COLOR,
      strokeWidth: 2
    });

    var instructionsTextString = step.instructions;
    var instructionsText = new Kinetic.Text({
      x: pathBlockWidth,
      y: 0,
      text: instructionsTextString,
      fontSize: 30,
      fontFamily: "HelveticaNeue-Medium",
      textFill: DIRECTION_STEP_ITEM_INSTR_COLOR,
      width: width-pathBlockWidth,
      padding: 5,
      align: "left"
    });


    var pathColor = UNKNOWN_STEP_COLOR;

    if (step.travel_mode === "TRANSIT") {
      pathColor = step.transit.line.color;
      if (step.transit.line !== undefined && step.transit.line.vehicle !== undefined) {
        var line = step.transit.line;
        var vehicleName = line.vehicle.name;
        if (vehicleName === "Bus") {
          pathColor = BUS_STEP_COLOR;
        }
      }
    } else if (step.travel_mode === "DRIVING") {
      pathColor = DRIVING_STEP_COLOR;
    } else if (step.travel_mode === "WALKING") { 
      pathColor = WALKING_STEP_COLOR;
    }
    
    var pathItem = DrawFns.createDirectionStepPathItem(pathBlockWidth/2, height, pathBlockWidth*0.5, pathColor);
    
    var duration = millisecondsToHumanString(step.duration.value * 1000);

    var durationTxt = new Kinetic.Text({
      x: pathBlockWidth,
      y: height/2,
      text: "(" + duration + ")",
      fontSize: 18,
      fontFamily: "HelveticaNeue-Medium",
      textFill: DIRECTION_STEP_ITEM_DURATION_COLOR,
      padding: 5,
      align: "left"
    });

    if (step.travel_mode === "WALKING") {
      //make a google map :D
      console.log("step is: " + step.instructions);
      console.log("centering map on " + step.start_location.toString());
      var displayWalkingMap = function() {
        console.log("starting displayWalkingMap");
        var directionsDisplay = new google.maps.DirectionsRenderer();  
        var mapOptions = {
          zoom: 7,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          center: step.start_location
        }
        map = new google.maps.Map(document.getElementById("screenContainer"), mapOptions);
        
        directionsDisplay.setMap(map);
        console.log("did directionsDisplay.setMap");
        
      };
      //var walkingMap = displayWalkingMap();
      //stepGroup.add(walkingMap);
      //console.log("added map to stepGroup");
    }

    stepGroup.add(background);
    stepGroup.add(instructionsText);
    stepGroup.add(pathItem);
    stepGroup.add(durationTxt);
    
    return stepGroup;
  };

  DrawFns.createDirectionStepPathItem = function (xMid, height, thickness, color) {
    var pathRect = new Kinetic.Rect({
      x: xMid-thickness/2,
      y: 0,
      width: thickness,
      height: height,
      fill: color
    });
    return pathRect;
  };

  DrawFns.displayDelayDesignA = function (appWidth, appHeight, alertText) {
    DrawFns.createModal(appWidth, appHeight, alertText);
  }

  DrawFns.displayDelayDesignB = function (appWidth, appHeight, alertText) {
    DrawFns.createModal(appWidth, appHeight, alertText);
  }

  DrawFns.createModal = function (appWidth, appHeight, alertText) {
    console.log("creating modal");
    var modalGroup = new Kinetic.Group();
    //grey out the background
    var greyBg = new Kinetic.Rect({
      x: 0,
      y: 0,
      color: GREYED_OUT_BACKGROUND_COLOR,
      opacity: .4
    });

    //create the modal rectangle
    var modalRect = new Kinetic.Rect({
      x: appWidth/4,
      y: appHeight/4,
      width: appWidth/2,
      height: appHeight/2,
      color: MODAL_BOX_COLOR,
      stroke: "white",
      strokeWidth: 2,
      cornerRadius: 3,
      opacity: .7
    });

    //create the alert text
    var text = new Kinetic.Text({
      text: alertText,
      fontFamily: 'HelveticaNeue-Light',
      textFill: "white",
      padding: 2
    });

    modalGroup.add(greyBg);
    modalGroup.add(modalRect);
    modalGroup.add(text);
    console.log("added all elements");
    return modalGroup;
  }

  return DrawFns;
});