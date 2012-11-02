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
    MEDIUM_DELAY: 300,
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
      fill: '#eee'
    })
  };
  Application.stage.add(graphicalComparisonScreen.mainLayer);
  graphicalComparisonScreen.mainLayer.add(graphicalComparisonScreen.background);
  graphicalComparisonScreen.mainLayer.add(graphicalComparisonScreen.routeItemsGroup);
  graphicalComparisonScreen.mainLayer.add(graphicalComparisonScreen.routeButtonsGroup);

// TODO: Think about actual implementation for this
  var detailedDirectionsScreen = {
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
  Application.stage.add(detailedDirectionsScreen.mainLayer);
  detailedDirectionsScreen.mainLayer.add(detailedDirectionsScreen.background);
  detailedDirectionsScreen.mainLayer.add(detailedDirectionsScreen.routeItemsGroup);
  detailedDirectionsScreen.mainLayer.add(detailedDirectionsScreen.routeButtonsGroup);
  detailedDirectionsScreen.mainLayer.hide();

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
  };

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
        endScreen.mainLayer.setPosition(0,0);
        startScreen.mainLayer.setPosition(0,0);
        startScreen.mainLayer.hide();
        startScreen.mainLayer.draw();
        endScreen.mainLayer.draw();
        /* END RESET */
      }, time);
    } else if (transition === 'SLIDE LEFT') {
      endScreen.mainLayer.moveToTop();
      startScreen.mainLayer.moveToBottom();
      endScreen.mainLayer.setPosition(Application.stage.getWidth(), 0);
      endScreen.mainLayer.show();

      var anim = new Kinetic.Animation({
        func: function(frame) {
          var fractionComplete = frame.time/time;
          var width = Application.stage.getWidth();

          endScreen.mainLayer.setPosition(
            width-fractionComplete*width,
            endScreen.mainLayer.getPosition().y);
          startScreen.mainLayer.setPosition(
            -fractionComplete*width,
            startScreen.mainLayer.getPosition().y);
          endScreen.mainLayer.draw();
          startScreen.mainLayer.draw();
        },
        node: Application.stage
      });

      anim.start();
      setTimeout(function () {
        anim.stop();
        /* RESET ORIGINAL SCREEN AND HIDE IT */
        startScreen.mainLayer.setPosition(0,0);
        endScreen.mainLayer.setPosition(0,0);
        startScreen.mainLayer.hide();
        startScreen.mainLayer.draw();
        endScreen.mainLayer.draw();
        /* END RESET */
      }, time);
    }
  };

  // Given a time, what is the x position on the canvas that corresponds to it?
  var posFromTime = function (time, initialTime, scalingFactor) {
    // Convert to seconds and scale by scalingFactor
    return (time - initialTime)/1000 * scalingFactor;
  };

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

  var generateRouteIconSelectedFunction = function (button, direction) {
    return function () {
      transitionScreen(graphicalComparisonScreen, detailedDirectionsScreen, 'SLIDE LEFT', Application.MEDIUM_DELAY);
      console.log('To the detailed directions screen!');
    }
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
        $(fieldId).blur();
        transitionScreen(routeSelectionScreen, graphicalComparisonScreen, 'SCALE TOP', Application.SHORT_DELAY);
        console.log('To the graphical comparison screen!');
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
        bg.setFill({
          start: {
            x: 0,
            y: -50
          },
          end: {
            x: 0,
            y: 50
          },
          colorStops: [0, 'rgb(5,138,245)', 1, 'rgb(1,93,230)']
        });
      }

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

    var scalingFactor = 0.2;
    var departureTime = new Date(direction.departure_time.value);
    var duration = direction.duration.value;
    var start = posFromTime(departureTime, Application.departure_time, scalingFactor);

    var timeOffset = departureTime;
    var startFlagExists = false;
    for (var stepIdx = 0; stepIdx < direction.steps.length; stepIdx++) {
      var stepColor = 'black';
      if (direction.steps[stepIdx].travel_mode === "TRANSIT") {
        stepColor = direction.steps[stepIdx].transit.line.color;
        if (direction.steps[stepIdx].transit.line !== undefined && direction.steps[stepIdx].transit.line.vehicle !== undefined) {
          var line = direction.steps[stepIdx].transit.line;
          var vehicleName = line.vehicle.name;
          if (vehicleName === "Bus") {
            stepColor = '#D3D15F'; // TODO: Change to be better yellow?
          }
        }
        timeOffset = new Date(direction.steps[stepIdx].transit.departure_time.value);
      } else if (direction.steps[stepIdx].travel_mode === "DRIVING") {
        stepColor = 'black';
      } else if (direction.steps[stepIdx].travel_mode === "WALKING") { 
        stepColor = '#00CED1'; // TODO: Change color
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
          var flag = createMessageBubble(stepStart, y+(0.65*height), 40, stepColor, firstTransitTime);
          routeGroup.add(flag);
          startFlagExists = true;
        }
      }
      if (isEnd) {
        var endTime = direction.arrival_time.text;
        var flag = createMessageBubble(stepEnd, y+(0.65*height), 40, stepColor, endTime);
        routeGroup.add(flag);
      }
      var stepLine = createStepLine(stepStart, stepEnd, y+height/2-10, 20, stepColor, firstRounded, isEnd);

      timeOffset.setSeconds(timeOffset.getSeconds()+direction.steps[stepIdx].duration.value);

      routeGroup.add(stepLine);

      var icon = null;
      var iconMid = {
        x: stepStart+(stepEnd - stepStart)/2,
        y: y+height/2+4
      };
      var iconSideLength = 30;

      if (direction.steps[stepIdx].travel_mode === "TRANSIT") {
        if (direction.steps[stepIdx].transit.line !== undefined && direction.steps[stepIdx].transit.line.vehicle !== undefined) {
          var line = direction.steps[stepIdx].transit.line;
          var vehicleName = line.vehicle.name;
          console.log(vehicleName);
          if (vehicleName === "Train" || vehicleName === "Subway" || vehicleName === "Light rail") {
            icon = createTIcon(iconMid.x-iconSideLength/2, iconMid.y, iconSideLength);
          } else if (vehicleName === "Bus") {
            icon = createBusIcon(iconMid.x-iconSideLength/2, iconMid.y, iconSideLength, stepColor, line.short_name);
          }
        } else if (direction.steps[stepIdx].travel_mode !== "WALKING"){
          console.log("What");
          console.log(direction.steps[stepIdx]);
        }
      } else if (direction.steps[stepIdx].travel_mode === "WALKING") {
        icon = createWalkingIcon(iconMid.x-iconSideLength/2, iconMid.y, iconSideLength, stepColor);
      } else if (direction.steps[stepIdx].travel_mode === "DRIVING") {
        icon = createCarIcon(iconMid.x-iconSideLength/2, iconMid.y, iconSideLength, stepColor);
      }
      
      if (icon == null) {
        // This means that an appropriate icon doesn't exist yet
        icon = createBusIcon(iconMid.x-iconSideLength/2, iconMid.y, iconSideLength, 'black', "?");
      }
      routeGroup.add(icon);
    }

    return routeGroup;
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
      
      graphicalRouteButton.on('click touchend', generateRouteIconSelectedFunction(graphicalRouteButton, direction));
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
