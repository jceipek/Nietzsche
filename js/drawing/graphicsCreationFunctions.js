define(["color-constants",
        "drawing/icons/bus-icon", 
        "drawing/icons/car-icon",
        "drawing/icons/t-icon",
        "drawing/icons/walking-icon"],
  function (colorconstants, busicon, caricon, ticon, walkingicon) {

    var DrawFns = {
      createBusIcon: busicon,
      createCarIcon: caricon,
      createTIcon: ticon,
      createWalkingIcon: walkingicon
    };


    //This is one of the headers like "Contacts", "Places", etc...
    DrawFns.createRouteHeader = function (y, width, height, headerTitle) {
    var group = new Kinetic.Group();
    var routeHeader = new Kinetic.Text({
      x: 0,
      y: y,
      text: headerTitle,
      fontSize: 20,
      fontFamily: 'HelveticaNeue-Light',
      textFill: LIST_HEADER_TEXT_COLOR,
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
        colorStops: LIST_HEADER_GRADIENT
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
    buttonGroup.setPosition({x: x, y: y+strokewidth});
    var selectionButton = new Kinetic.Rect({
      x: 0,
      y: 0,
      width: width,
      height: height-strokewidth*2,
      fill: '#777777',
      strokeWidth: strokewidth,
      stroke: "#424242",
      cornerRadius: 10,
    });
    var selectionButtonGrabLeft = new Kinetic.Line({
      points: [width/4, 0.1*height, width/4, 0.9*height],
      stroke: color,
      strokeWidth: 8,
      lineCap: "round",
    });
     var selectionButtonGrabRight = new Kinetic.Line({
      points: [2*width/4, 0.1*height, 2*width/4, 0.9*height],
      stroke: color,
      strokeWidth: 8,
      lineCap: "round",
    });
      var selectionButtonGrabMiddle = new Kinetic.Line({
      points: [3*width/4, 0.1*height, 3*width/4, 0.9*height],
      stroke: color,
      strokeWidth: 8,
      lineCap: "round",
    });

    buttonGroup.add(selectionButton);
    buttonGroup.add(selectionButtonGrabMiddle);
    buttonGroup.add(selectionButtonGrabRight);
    buttonGroup.add(selectionButtonGrabLeft);
    buttonGroup.getWidth = function () {
      return selectionButton.getWidth()
    };
    return buttonGroup;
  };

  var getBigDivisionSize = function(scalingFactor) {
    // XXX: Currently hardcodes fake width of time bar text
    var hardcoded_width = 70;
    var div_size = 5;
    while (60*div_size*scalingFactor < hardcoded_width) {
      div_size += 5;
    }
    return div_size;
  };

  DrawFns.createGraphicalTimeBar = function (startx, endx, height, barStartTime, barEndTime, departureTime, scalingFactor) {
    var timeBarGroup = new Kinetic.Group();
    var bg = new Kinetic.Rect({
      x: startx,
      y: 0,
      width: endx-startx,
      height: height,
      fill: "black"
    });

    timeBarGroup.add(bg);
    
    var currTime = new Date(barStartTime);

    var bigDivisionSize = getBigDivisionSize(scalingFactor);

    while (currTime < barEndTime) {
      var timeTxt = formatTime(currTime);

      var timeItem = new Kinetic.Text({
        x: 2+posFromTime(currTime, departureTime, scalingFactor),
        y: 13,
        text: timeTxt,
        textFill: 'white',
        padding: 0,
        fontSize: 15,
        fontFamily: "HelveticaNeue-Medium"
      });
      timeBarGroup.add(timeItem);
      currTime.setMinutes(currTime.getMinutes() + bigDivisionSize);
    }

    return timeBarGroup;  
  }

  DrawFns.createGraphicalIntervalLines = function (y, height, linesYOverlap, lineStartTime, lineEndTime, departureTime, scalingFactor) {
    var timeIterator = new Date(lineStartTime);
    var linesGroup = new Kinetic.Group();
    var bigDivisionSize = getBigDivisionSize(scalingFactor);
    while (timeIterator < lineEndTime) {
      timeIterator.setMinutes(timeIterator.getMinutes()+5);
      var x = posFromTime(timeIterator, departureTime, scalingFactor);
      var pt1 = {x: x, y: y+linesYOverlap};
      var pt2 = {x: x, y: height+y};
      var strokeWidth = 1;
      var color = "rgb(200,200,200)";
      if (timeIterator.getMinutes() % bigDivisionSize === 0) {
        pt1 = {x: x, y: y};
        strokeWidth = 3;
        color = "rgb(150,150,150)";
      }
      var currLine = new Kinetic.Line({
        points: [pt1, pt2],
        stroke: color,
        strokeWidth: strokeWidth
      });
      linesGroup.add(currLine);
    }    
    return linesGroup;
  }
    
  DrawFns.createPopUpMessageBubble = function (x, y, height, text) {
    var offset = 0;
    var l = height;
    var bubbleGroup = new Kinetic.Group();
    var textInset = 0.125 * height;
    var bubbleText = new Kinetic.Text({
      x: x,
      y: y-textInset*5,
      text: text,
      fontSize: 18,
      fontFamily: "HelveticaNeue-Medium",
      textFill: "black",
      padding: textInset,
      align: "left",
    });
    var textwidth = bubbleText.getWidth();
    var bg = new Kinetic.Shape({
      drawFunc: function (ctx) {
        ctx.beginPath();
        
        ctx.moveTo(x, y); 
        ctx.lineTo(x, y-l); 
        ctx.lineTo(x+textwidth, y-l);
        ctx.lineTo(x+textwidth, y+l*.2);
        ctx.lineTo(x-textwidth*.3, y+l*.2);
        ctx.lineTo(x, y);
        
        ctx.lineWidth = 1;
        ctx.closePath();
        this.fill(ctx);
        
      },
      fill: 'yellow'
    });

    bubbleGroup.add(bg);
    bubbleGroup.add(bubbleText);
    //bubbleGroup.setPosition(x, y);
    return bubbleGroup;
  };

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

  DrawFns.createArrivalBar = function (width, height, y, timeString, pathBlockWidth) {
    var textInset = height*0.27;
    var arrivalBarGroup = new Kinetic.Group();
    arrivalBarGroup.setPosition(0,y);
    var background = new Kinetic.Rect({
      x: 0,
      y: 0,
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
        colorStops: ARRIVAL_BAR_GRADIENT
      },
      opacity: 0.95,
      stroke: 'white',
      strokeWidth: 2
    });
    var arrivalText = "Estimated Arrival Time: "+timeString;
    var text = new Kinetic.Text({
      x: pathBlockWidth,
      y: 0,
      text: arrivalText,
      fontSize: 25,
      fontFamily: "HelveticaNeue-Medium",
      textFill: ARRIVAL_BAR_TEXT_COLOR,
      shadow: {
        color: ARRIVAL_BAR_SHADOW_COLOR,
        offset: {
          x: 0,
          y: 3
        },
        blur: 3
      },
      padding: textInset,
      align: "left"
    });
    arrivalBarGroup.add(background);
    arrivalBarGroup.add(text);
    return arrivalBarGroup;
  };
  
  // TODO: declare two lines instead of one rectangle
   DrawFns.createWaitStep = function (yMid, thickness, height, start, end, color) {
    var waitLineGroup = new Kinetic.Group();
    var upLine = new Kinetic.Rect({
      x: start,
      y: yMid-thickness/2,
      width: end-start,
      height: height,
      fill: color
    });
    
    var bottomLine = new Kinetic.Rect({
      x: start,
      y: yMid+thickness/2-height,
      width: end-start,
      height: height,
      fill: color
    });
    
    waitLineGroup.add(upLine);
    waitLineGroup.add(bottomLine);
    return waitLineGroup;
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

  DrawFns.createDirectionStepItem = function (y, width, height, pathBlockWidth, step, mapXOffset, mapYOffset, mapSrc) {

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
    stepGroup.add(background);

    if (step.travel_mode === "WALKING") {
      //make a google map :D
      console.log("step is: " + step.instructions);
      console.log("centering map on " + step.start_location.toString());

      var imageObj = new Image();
      imageObj.onLoad = function() {
        var map = new Kinetic.Image({
          x: width-mapXOffset,
          y: height-mapYOffset,
          image: imageObj,
          width: 300,
          height: 300
        });
        stepGroup.add(map);
        console.log("added map to stepGroup");     
      };
      imageObj.src = mapSrc;
    }

    //stepGroup.add(background);
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
