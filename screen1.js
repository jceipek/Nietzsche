// NOTE: we have global access to all PossibleRoutes and ROUTE_TYPES
var demoTime = null;
demoTime = new Date(1351774692398); // Comment this out if we want to use the current time.
$(function() {

  var Application = {
    from_route: null,
    to_route: null,
    departure_time: new Date(),
    directions: [],
    SHORT_DELAY: 200,
    stage: new Kinetic.Stage({
      container: 'screenContainer',
      width: 640,
      height: 940})
  };

  var routeSelectionScreen = {
    portraitData: {
      listHeaderHeight: 40,
      listItemHeight: 150
    },
    mainLayer: new Kinetic.Layer(),
    listItemsGroup: new Kinetic.Group(),
    background: new Kinetic.Rect({
      x: 0,
      y: 0,
      width: Application.stage.getWidth(),
      height: Application.stage.getHeight(),
      fill: '#eee'
    })
  };
  Application.stage.add(routeSelectionScreen.mainLayer);
  routeSelectionScreen.mainLayer.add(routeSelectionScreen.background);
  routeSelectionScreen.mainLayer.add(routeSelectionScreen.listItemsGroup);

  var graphicalComparisonScreen = {
    portraitData: {
      routeItemHeight: 150,
      routeSelectionButtonWidth: 88
    },
    mainLayer: new Kinetic.Layer(),
    routeItemsGroup: new Kinetic.Group(),
    routeButtonsGroup: new Kinetic.Group(),
    background: new Kinetic.Rect({
      x: 0,
      y: 0,
      width: Application.stage.getWidth(),
      height: Application.stage.getHeight(),
      fill: '#e00'
    })
  };
  Application.stage.add(graphicalComparisonScreen.mainLayer);
  graphicalComparisonScreen.mainLayer.add(graphicalComparisonScreen.background);
  graphicalComparisonScreen.mainLayer.add(graphicalComparisonScreen.routeItemsGroup);
  graphicalComparisonScreen.mainLayer.add(graphicalComparisonScreen.routeButtonsGroup);

  // Given a route and a search string, indicates whether the route is
  //   matches the string.
  var routeMatchesStringFilter = function (route, string, type) {
    string = string.toLowerCase()
    if (type !== undefined && type !== route.type) {
      return false;
    }
    if (string === '') {
      return false;
    }
    if(route.nickname.toLowerCase().search(string) !== -1
      || route.name.toLowerCase().search(string) !== -1
      || route.address.toLowerCase().search(string) !== -1
      || route.location.toLowerCase().search(string) !== -1) {
      return true;
    }
    return false;
  }

  // Transitions from one screen to another using mainLayer
  // POSSIBLE_TRANSITIONS: 'SWAP', 'SCALE TOP'
  var transitionScreen = function (startScreen, endScreen, transition, time) {
    if (time === undefined) {
      time = 0; // Default transition time
    }
    if (transition === 'SWAP') {
      startScreen.mainLayer.hide();
      endScreen.mainLayer.show();
      endScreen.mainLayer.draw();
      startScreen.mainLayer.draw();
    }

    if (transition === 'SCALE TOP') {
      endScreen.mainLayer.moveToBottom();
      startScreen.mainLayer.moveToTop();
      endScreen.mainLayer.show();
      endScreen.mainLayer.draw();

      var anim = new Kinetic.Animation({
        func: function(frame) {
          var scale = Math.cos(frame.time * Math.PI / time / 2) + 0.001;
          // scale x and y
          startScreen.mainLayer.setPosition(
            Application.stage.getWidth()/2,
            Application.stage.getHeight()/2            
          );
          startScreen.mainLayer.setOffset(
            Application.stage.getWidth()/2,
            Application.stage.getHeight()/2
          );
          startScreen.mainLayer.setScale(scale);
          startScreen.mainLayer.draw();
        },
        node: Application.stage
      });

      anim.start();

      setTimeout(function () {
        anim.stop();
        /* RESET ORIGINAL SCREEN AND HIDE IT */
        startScreen.mainLayer.setScale(1);
        startScreen.mainLayer.setOffset(0,0);
        startScreen.mainLayer.setPosition(0,0);
        startScreen.mainLayer.hide();
        startScreen.mainLayer.draw();
        /* END RESET */
      }, time);

    }
  };

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

  var generateListItemSelectedFunction = function (item, fieldId, route) {
    return function () {
      var listGroup = routeSelectionScreen.listItemsGroup;
      var fromFieldValue = $('#from-field').val();
      var toFieldValue = $('#to-field').val();
      $(fieldId).val(route.nickname);
      if (fieldId === '#from-field') {
        Application.from_route = route;
      } else if (fieldId === '#to-field') {
        Application.to_route = route;
      }
      if(fromFieldValue !== '' && toFieldValue !== '') {
        setTimeout(function () {
          var listGroup = routeSelectionScreen.listItemsGroup;
          listGroup.removeChildren();
          routeSelectionScreen.mainLayer.draw();
        }, Application.SHORT_DELAY);
        //Start Generating Routes
        if (demoTime == null) {
          Application.departure_time = new Date();
        }
        computeDirections();
        transitionScreen(routeSelectionScreen, graphicalComparisonScreen, 'SCALE TOP', Application.SHORT_DELAY);
        console.log('NEXT SCREEN!');
      }

      if (fieldId == '#from-field') {
        setTimeout(function () {
          var listGroup = routeSelectionScreen.listItemsGroup;
          listGroup.removeChildren();
          routeSelectionScreen.mainLayer.draw();
        }, Application.SHORT_DELAY);
        $('#to-field').focus()
      }

      // Make the item look selected
      var bg = item.get('.background')[0];
      if (bg != undefined) {
        bg.setFill(
          {
            start: {
              x: 0,
              y: -50
            },
            end: {
              x: 0,
              y: 50
            },
            colorStops: [0, 'rgb(5,138,245)', 1, 'rgb(1,93,230)']
          }
        );
      };

      // Swap out the text fill to make the item look selected
      var txts = item.get('.text');
      for (var txtIdx = 0; txtIdx < txts.length; txtIdx++) {
        var txt = txts[txtIdx];
        var tempTextFill = txt.getTextFill();
        txt.setTextFill(txt.getAttrs().swapTextFill);
        txt.setAttrs({swapTextFill: tempTextFill});
      }


      routeSelectionScreen.mainLayer.draw();
    };
  };

  var generateSearchFieldFunction = function (fieldId) {
    return function () {
      var currentValue = $(fieldId).val();
      var screenWidth = Application.stage.getWidth();
      var screenHeight = Application.stage.getHeight();
      var itemHeight = routeSelectionScreen.portraitData.listItemHeight;
      var headerHeight = routeSelectionScreen.portraitData.listHeaderHeight;
      var listGroup = routeSelectionScreen.listItemsGroup;

      console.log(currentValue);
      listGroup.removeChildren(); // Clear the list

      listGroup.setDraggable('true');
      listGroup.setPosition(0,0);

      var currYOffset = 0;
      for (var routeTypeIdx=0; routeTypeIdx < ROUTE_TYPES.length; routeTypeIdx++) {
        var headerString = ROUTE_TYPES[routeTypeIdx];
        var matches = 0;
        for (var i=0; (i < PossibleRoutes.length); i++) {
          if (routeMatchesStringFilter(PossibleRoutes[i], currentValue, headerString)) {
            if (matches === 0) {
              var item = createRouteHeader(currYOffset, screenWidth, headerHeight, headerString);
              listGroup.add(item);
              currYOffset += headerHeight;
              matches++;
            }
            var item = createRouteItem(currYOffset, screenWidth, itemHeight, PossibleRoutes[i]);
            item.on('click touchend', generateListItemSelectedFunction(item, fieldId, PossibleRoutes[i]));
            listGroup.add(item);
            currYOffset += itemHeight;
          }
        }
      }
      listGroup.setDragBoundFunc(function (pos) {
        var y = pos.y;
        y = Math.min(y,0);
        return {
          x: 0,
          y: y
        };
      });
      routeSelectionScreen.mainLayer.draw();
    };
  };

  // Given a time, what is the x position on the canvas that corresponds to it?
  var posFromTime = function (time, initialTime, scalingFactor) {
    // Convert to seconds and scale by scalingFactor
    return (time - initialTime)/1000 * scalingFactor;
  };

  var createGraphicalRouteItem = function (y, width, height, direction) {
    
    var routeGroup = new Kinetic.Group();
    var background = new Kinetic.Rect({
      x: 0,
      y: y,
      width: width,
      height: height,
      fill: 'white',
      stroke: 'black'
    });
    routeGroup.add(background);

    var scalingFactor = 0.1;
    var departureTime = new Date(direction.departure_time.value);
    var duration = direction.duration.value;
    var start = posFromTime(departureTime, Application.departure_time, scalingFactor);

    var timeOffset = departureTime;
    var startFlagExists = false;
    for (var stepIdx = 0; stepIdx < direction.steps.length; stepIdx++) {
      var stepColor = 'black';
      if (direction.steps[stepIdx].travel_mode === "TRANSIT") {
        stepColor = direction.steps[stepIdx].transit.line.color;
        timeOffset = new Date(direction.steps[stepIdx].transit.departure_time.value);
      }

      var firstRounded = (stepIdx === 0);
      var isEnd = (stepIdx === direction.steps.length-1);

      var stepStart = posFromTime(timeOffset, Application.departure_time, scalingFactor);

      var stepEnd = new Date(timeOffset);
      stepEnd.setSeconds(stepEnd.getSeconds()+direction.steps[stepIdx].duration.value);
      stepEnd = posFromTime(stepEnd, Application.departure_time, scalingFactor);

      if (direction.steps[stepIdx].travel_mode === "TRANSIT") {
        if (startFlagExists === false) {
          var firstTransitTime = direction.steps[stepIdx].transit.departure_time.text;
          var flag = createMessageBubble(stepStart, y+height/2, 30, stepColor, firstTransitTime);
          routeGroup.add(flag);
          startFlagExists = true;
        }
      }
      if (isEnd) {
        var endTime = direction.arrival_time.text;
        var flag = createMessageBubble(stepEnd, y+height/2, 30, stepColor, endTime);
          routeGroup.add(flag);
      }
      var stepLine = createStepLine(stepStart, stepEnd, y+height/2-10, 20, stepColor, firstRounded, isEnd);

      timeOffset.setSeconds(timeOffset.getSeconds()+direction.steps[stepIdx].duration.value);

      routeGroup.add(stepLine);

      var iconMid = {
        x: stepStart+(stepEnd - stepStart)/2,
        y: y+height/2+4
      };
      var iconSideLength = 30;
      var icon = createBusIcon(iconMid.x-iconSideLength/2, iconMid.y, iconSideLength, 'blue', '6');
      //var icon = createTIcon(iconMid.x-iconSideLength/2, iconMid.y, iconSideLength);
    
      routeGroup.add(icon);
    }

    return routeGroup;
  };

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
  }


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
   }

   var createTIcon = function (x, y, sidelength) {
    //TODO: Make it that it looks like a real T icon
       var tIcon = new Kinetic.Group();
       var radius = sidelength/2;
       
       var verticalRect = new Kinetic.Rect({
          x: x+sidelength*0.425,
          y: y+sidelength*0.40,
          height: sidelength*0.5,
          width: sidelength*0.207,
          fill: 'black'
       });
       
       var horizontalRect = new Kinetic.Rect({
          //x: x+sidelength*0.21,
          //y: y+sidelength*0.13,
          x: x+sidelength*0.15,
          y: y+sidelength*0.25,
          //height: sidelength*0.173,
          height: sidelength*0.207,
          width: sidelength*0.736,
          fill: 'black'
       });
       
       var tIconCircle = new Kinetic.Circle({
           x: x+radius,
           y: y+radius,
           radius: radius,
           stroke: 'black',
           strokeWidth: sidelength*0.0363
       });
       
       
       tIcon.add(tIconCircle);
       tIcon.add(horizontalRect);
       tIcon.add(verticalRect);
       
         return tIcon; 
       }
       
       
var createBusIcon = function(x,y, sidelength, color, number){
      var busIcon = new Kinetic.Group();
      
      var inset = sidelength/6;
      var lightInset = sidelength/5;
      var lightRadius = sidelength*0.05;
      var arcInset = sidelength*0.25;
      var wheelWidth = sidelength*0.2;
      var wheelInset = sidelength*0.15;
      var radius = sidelength/2;
      
      busIcon.setPosition(x,y);
      
      var busNumber = new Kinetic.Text({
          x: 0,
          y: sidelength,
          text: number,
          fontSize: 20,
          fontFamily: "Calibri",
          fontStyle: 'bold',
          align: 'center',
          textFill: "white",
          padding: inset
       });
       
      var iconbg = new Kinetic.Rect({
        x: 0,
        y: 0,
        height: sidelength*2,
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
      
      var busWindow = new Kinetic.Shape({
        drawFunc: function(context) {
        context.beginPath();
        context.arc(busNumber.getWidth()/2, radius, radius-arcInset, 0, Math.PI, true);
        context.closePath();
        context.fillStyle = color;
        context.fill();
      }
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
      
}

var createWalkingIcon = function (x, y, sideLength) {
    //TODO: Fix scaling
    //var iconGroup = new Kinetic.Group();
    //var iconBg = createRoundedIconBg(x, y, sideLength, 'red');
    //iconGroup.add(createRoundedIconBg(x,y,sideLength,'red'));
    var walkingIcon = new Kinetic.Shape({
        drawFunc: function(context) {
          //head+body
          context.moveTo(x+(0.588*sideLength)/*(sideLength-35)*/,y+(0.0588*sideLength));//y+(sideLength-80));
          context.lineTo(x+(0.471*sideLength)/*(sideLength-45)*/,y+(0.3125*sideLength));//(sideLength-60));
          context.lineTo(x+(0.471*sideLength)/*(sideLength-45)*/,y+(0.588*sideLength));//(sideLength-30));
          //legs
          context.moveTo(x+(0.235*sideLength)/*(sideLength-65)*/,y+(0.941*sideLength));//(sideLength-5));
          context.lineTo(x+(0.471*sideLength)/*(sideLength-45)*/,y+(0.588*sideLength));//(sideLength-30));
          context.lineTo(x+(0.706*sideLength)/*(sideLength-25)*/,y+(0.765*sideLength));//(sideLength-20));
          context.lineTo(x+(0.706*sideLength)/*(sideLength-25)*/,y+(0.941*sideLength));//(sideLength-5));
          //arms
          context.moveTo(x+(0.235*sideLength)/*(sideLength-65)*/,1*sideLength);
          context.lineTo(x+(0.412*sideLength)/*(sideLength-50)*/,y+(0.235*sideLength));//(sideLength-65));
          context.lineTo(x+(0.706*sideLength)/*(sideLength-25)*/,1*sideLength);
          context.lineCap = 'round';
          this.stroke(context);
        },
        stroke: 'black',
        strokeWidth: 5.25,
        lineJoin: 'round',
        });
    //iconGroup.add(iconBg);
    return walkingIcon;
  }

  var createMessageBubble = function (anchorX, anchorY, height, color, text) {
    var offset = 0;
    var l = height;
    var bubbleGroup = new Kinetic.Group();
    var bg = new Kinetic.Shape({
      //TODO: Fill this out
      drawFunc: function (ctx) {
        ctx.beginPath();
        ctx.moveTo(0, .692*l);
        ctx.lineTo(offset, .427*l);
        ctx.arc(.077*l+offset, .077*l, .077*l, Math.PI, 1.5*Math.PI, false)
        ctx.arc(.923*l+offset, .077*l, .077*l, 1.5*Math.PI, 0, false);
        ctx.arc(.923*l+offset, .4*l, .077*l, 0, 0.5*Math.PI, false);
        ctx.lineTo(.154*l+offset, .477*l);
        ctx.lineTo(0, .692*l);
        ctx.lineWidth = 1;
        ctx.closePath();
        this.fill(ctx);        
      },
      fill: color,
   
    });

    var textInset = 0.1 * height;
    var bubbleText = new Kinetic.Text({
      x: 0,
      y: 0,
      text: text,
      fontSize: 11,
      fontFamily: "HelveticaNeue-Medium",
      textFill: "white",
      padding: textInset,
      align: "left"
    });

    bubbleGroup.add(bg);
    bubbleGroup.add(bubbleText);
    bubbleGroup.setPosition(anchorX, anchorY - height * 2);
    return bubbleGroup;
  }

  var createGraphicalRouteButton = function (x, y, width, height, direction) {
    var buttonGroup = new Kinetic.Group();
    var selectionButton = new Kinetic.Rect({
      x: x,
      y: y,
      width: width,
      height: height,
      fill: 'black',
      cornerRadius: 20
    });

    buttonGroup.add(selectionButton);
    return buttonGroup;
  }

  var computeDirections = function () {
    var router = new google.maps.DirectionsService();
    var start = Application.from_route;
    var end = Application.to_route;
    var request = {
      origin: start.mapsData.location,
      destination: end.mapsData.location,
      travelMode: google.maps.TravelMode.TRANSIT,
      transitOptions: {
        departureTime: Application.departure_time,
      },
      provideRouteAlternatives: true,
      unitSystem: google.maps.UnitSystem.IMPERIAL
    };
    router.route(request, function (response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        for (var routeIdx = 0; routeIdx < response.routes.length; routeIdx++) {
          var legs = response.routes[routeIdx].legs;
          var leg = legs[0];
          if (leg) {
            Application.directions.push(leg);
          }
        }
        displayGraphicalRoutes();
        console.log(response);
      } else {
        console.log('Routing Failed!');
      }
    });
  };

  var displayGraphicalRoutes = function () {
    console.log(Application.directions);
    for (var directionIdx = 0; directionIdx < Application.directions.length; directionIdx++) {
      var direction = Application.directions[directionIdx];
      var graphicalRouteItem = 
        createGraphicalRouteItem(directionIdx*graphicalComparisonScreen.portraitData.routeItemHeight, Application.stage.getWidth(), 
                                 graphicalComparisonScreen.portraitData.routeItemHeight, direction);
      var graphicalRouteButton = createGraphicalRouteButton(Application.stage.getWidth()-graphicalComparisonScreen.portraitData.routeSelectionButtonWidth,
                                   directionIdx*graphicalComparisonScreen.portraitData.routeItemHeight, 
                                   graphicalComparisonScreen.portraitData.routeSelectionButtonWidth, 
                                   graphicalComparisonScreen.portraitData.routeItemHeight);
      graphicalComparisonScreen.routeItemsGroup.add(graphicalRouteItem);
      graphicalComparisonScreen.routeButtonsGroup.add(graphicalRouteButton);
    }
    graphicalComparisonScreen.mainLayer.draw();
  };

  var getFirstRouteWithMatch = function (string) {
    for (var routeIdx = 0; routeIdx < PossibleRoutes.length; routeIdx++)
    {
      if (routeMatchesStringFilter(PossibleRoutes[routeIdx], string)) {
        return PossibleRoutes[routeIdx];
      }
    }
  };


  $('#screen-wrapper').bind('touchmove', function (e) {
    e.preventDefault();
  });
  $('#screen-wrapper').bind('touchmove', function (e) {
    e.preventDefault();
  });
  $('#from-field').keyup(generateSearchFieldFunction('#from-field'));
  $('#to-field').keyup(generateSearchFieldFunction('#to-field'));

  Application.from_route = getFirstRouteWithMatch('Here');

  if (demoTime != null) {
    Application.departure_time = demoTime;
  }

  $('#to-field').focus();

  //$('#to-field').bind('click', focus-to-field());

 // $('#to-field').bind('touchstart', function() {
   //  $('#to-field').focus();
    //});
    //$('#to-field').trigger('touchstart');
  
  //function focus-to-field() {
    //$('#to-field').focus();
  //}

});
