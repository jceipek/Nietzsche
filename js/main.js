require(["app", "routeData", "googleMapsResponse",
         "color-constants", 
         "helpers", 
         "drawing/graphicsCreationFunctions"], 
function(App, PossibleRoutes, googleMapsResponse_SAVED, color_constants, helpers, DrawFns){
  // NOTE: we have global access to all PossibleRoutes and ROUTE_TYPES
  var demoTime = null;
  //demoTime = new Date(1351774692398); // Comment this out if we want to use the current time.
  
  var RouteSelectionScreen = {
    portraitData: {
      listHeaderHeight: 40,
      listItemHeight: 150
    },
    mainLayer: new Kinetic.Layer(),
    listItemsGroup: new Kinetic.Group(),
    background: new Kinetic.Rect({
      x: 0,
      y: 0,
      width: App.getCanvasWidth(),
      height: App.stage.getHeight(),
      fill: ROUTE_SELECTION_SCREEN_BG_COLOR
    })
  };

  if($('#from-field').val() === 'Here'){
    $('#from-field').css('color', CURRENT_LOCATION_COLOR);
  }

  RouteSelectionScreen.mainLayer.add(RouteSelectionScreen.background);
  RouteSelectionScreen.mainLayer.add(RouteSelectionScreen.listItemsGroup);
  App.active_screen = RouteSelectionScreen;

  var GraphicalComparisonScreen = {
    portraitData: {
      routeItemHeight: 150,
      routeSelectionButtonWidth: 88,
      timeBarHeight: 40
    },
    mainLayer: new Kinetic.Layer(),
    routeItemsGroup: new Kinetic.Group(),
    routeButtonsGroup: new Kinetic.Group(),
    background: new Kinetic.Rect({
      x: 0,
      y: 0,
      width: App.getCanvasWidth(),
      height: App.stage.getHeight(),
      fill: GRAPHICAL_COMPARISON_SCREEN_BG_COLOR
    })
  };
  GraphicalComparisonScreen.mainLayer.add(GraphicalComparisonScreen.background);
  GraphicalComparisonScreen.mainLayer.add(GraphicalComparisonScreen.routeItemsGroup);
  GraphicalComparisonScreen.mainLayer.add(GraphicalComparisonScreen.routeButtonsGroup);

// TODO: Think about actual implementation for this
  var DetailedDirectionsScreen = {
    portraitData: {
      moveDirectionItemHeight: 250,
      waitDirectionItemHeight: 40,
      arrivalBarHeight: 70,
      pathBlockWidth: 50,
      sideBarWidth: 40,
      sideBarYOffset: 15
    },
    mainLayer: new Kinetic.Layer(),
    arrivalTimeGroup: new Kinetic.Group(),
    directionsGroup: new Kinetic.Group(),
    background: new Kinetic.Rect({
      x: 0,
      y: 0,
      width: App.getCanvasWidth(),
      height: App.stage.getHeight(),
      fill: DETAILED_DIRECTIONS_SCREEN_BG_COLOR
    })
  };

  DetailedDirectionsScreen.mainLayer.add(DetailedDirectionsScreen.background);
  DetailedDirectionsScreen.mainLayer.add(DetailedDirectionsScreen.directionsGroup);
  DetailedDirectionsScreen.mainLayer.add(DetailedDirectionsScreen.arrivalTimeGroup);
  DetailedDirectionsScreen.mainLayer.hide();
  

  App.stage.add(DetailedDirectionsScreen.mainLayer);
  App.stage.add(GraphicalComparisonScreen.mainLayer);
  App.stage.add(RouteSelectionScreen.mainLayer);

  // Given a route and a search string, indicates whether the route
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
    var finalize = function () {
      App.heightOffset = $('#top-bar').height();
      App.active_screen = endScreen;
    };

    if (time === undefined) {
      time = 0; // Default transition time
    }

    if (endScreen === RouteSelectionScreen) {
      $('#from-field').removeClass('from-field-small');
      $('#to-field').removeClass('to-field-small');
    } else {
      $('#from-field').addClass('from-field-small');
      $('#to-field').addClass('to-field-small');
    }

    if (transition === 'SWAP') {
      startScreen.mainLayer.hide();
      endScreen.mainLayer.show();
      endScreen.mainLayer.draw();
      startScreen.mainLayer.draw();
      finalize();
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
            App.getCanvasWidth()/2,
            App.stage.getHeight()/2            
          );
          startScreen.mainLayer.setOffset(
            App.getCanvasWidth()/2,
            App.stage.getHeight()/2
          );
          startScreen.mainLayer.setScale(scale);
          startScreen.mainLayer.draw();
        },
        node: App.stage
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
        finalize();
        /* END RESET */
      }, time);
    } else if (transition === 'SLIDE LEFT') {
      endScreen.mainLayer.moveToTop();
      startScreen.mainLayer.moveToBottom();
      endScreen.mainLayer.setPosition(App.getCanvasWidth(), 0);
      endScreen.mainLayer.show();

      var anim = new Kinetic.Animation({
        func: function(frame) {
          var fractionComplete = frame.time/time;
          fractionComplete = Math.min(fractionComplete, 1);
          fractionComplete = Math.max(fractionComplete, 0);
          var width = App.getCanvasWidth();

          endScreen.mainLayer.setPosition(
            width-fractionComplete*width,
            endScreen.mainLayer.getPosition().y);
          startScreen.mainLayer.setPosition(
            -fractionComplete*width,
            startScreen.mainLayer.getPosition().y);
          endScreen.mainLayer.draw();
          startScreen.mainLayer.draw();
        },
        node: App.stage
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
        finalize();
        /* END RESET */
      }, time);
    }
  };

  var computeDirectionsWithGoogleData = function () {
    var router = new google.maps.DirectionsService();
    var start = App.from_route;
    var end = App.to_route;
    var request = {
      origin: start.mapsData.location,
      destination: end.mapsData.location,
      travelMode: google.maps.TravelMode.TRANSIT,
      transitOptions: {
        departureTime: App.departure_time,
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
            App.directions.push(leg);
          }
        }
        displayGraphicalRoutes();
        console.log(response);
      } else {
        console.log('Routing Failed!');
      }
    });
  };

    var computeDirectionsWithSavedData = function () {
    console.log("Using simulated data without internet connection.");
    var response = SAVED_DATA;
    for (var routeIdx = 0; routeIdx < response.routes.length; routeIdx++) {
      var legs = response.routes[routeIdx].legs;
      var leg = legs[0];
      if (leg) {
        App.directions.push(leg);
      }
    }
    displayGraphicalRoutes();
  };

  var computeDirections = function () {
    if (App.use_simulated_data) {
      computeDirectionsWithSavedData();
    } else {
      computeDirectionsWithGoogleData();
    }
  };

  var generateRouteIconSelectedFunction = function (button, direction) {
    return function () {
      App.chosen_direction = direction;
      displayDetailedDirections();
      /*
      console.log("Oh, HAI");

      transitionScreen(GraphicalComparisonScreen, DetailedDirectionsScreen, 'SLIDE LEFT', App.MEDIUM_DELAY);
      if (App.simulate_delay) {
        var delay_time = App.MIN_TIME_UNTIL_SIMULATED_DELAY + Math.random() * (App.MAX_TIME_UNTIL_SIMULATED_DELAY - App.MIN_TIME_UNTIL_SIMULATED_DELAY);
        console.log("SIMULATED DELAY IN " + delay_time);
        setTimeout(function () {
          console.log("DELAY!");
          if (App.isDesignA()) {
              displayDelayDesignA();
          }
          if (App.isDesignB()) {
            displayDelayDesignB();
            transitionScreen(DetailedDirectionsScreen, GraphicalComparisonScreen, 'SWAP', App.MEDIUM_DELAY);
          }
        }, delay_time);
      }
      */
      console.log('To the detailed directions screen!');
    }
  };

  var generateRouteButtonBounceFunction = function (button, direction) {
    return function () {
      console.log("bounce");
      var old_button_pos = button.getPosition();
      var time = 1000;
      button.moveTo(DetailedDirectionsScreen.mainLayer);
      DetailedDirectionsScreen.mainLayer.show();
      DetailedDirectionsScreen.mainLayer.moveToTop();
      button.setPosition({x: -button.getWidth(), y:old_button_pos.y});
      DetailedDirectionsScreen.mainLayer.draw();

      var anim = new Kinetic.Animation({
        func: function(frame) {
          var offset = Math.abs(Math.sin(frame.time * Math.PI / time * 3))*(time/frame.time*0.1);
          DetailedDirectionsScreen.mainLayer.setOffset({x:-App.getCanvasWidth()+offset*30, y:0});
          DetailedDirectionsScreen.mainLayer.draw();
        },
        node: App.stage
      });

      anim.start();

      setTimeout(function () {
        anim.stop();

        /* RESET ORIGINAL SCREEN AND HIDE IT */
        DetailedDirectionsScreen.mainLayer.setOffset({x:0, y:0});
        DetailedDirectionsScreen.mainLayer.hide();
        button.moveTo(GraphicalComparisonScreen.routeButtonsGroup);
        button.setPosition(old_button_pos);
        GraphicalComparisonScreen.mainLayer.draw();
        DetailedDirectionsScreen.mainLayer.draw();
        /* END RESET */

        // XXX: FIX THIS!
        transitionScreen(GraphicalComparisonScreen, DetailedDirectionsScreen, 'SLIDE LEFT', App.MEDIUM_DELAY);
      }, time);
    }
  }

  var generateSearchFieldFunction = function (fieldId) {
    return function () {
      var currentValue = $(fieldId).val();
      $(fieldId).css('color', NORMAL_FIELD_TEXT_COLOR);
      var screenWidth = App.getCanvasWidth();
      var screenHeight = App.stage.getHeight();
      var itemHeight = RouteSelectionScreen.portraitData.listItemHeight;
      var headerHeight = RouteSelectionScreen.portraitData.listHeaderHeight;
      var listGroup = RouteSelectionScreen.listItemsGroup;
      
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
                var item = DrawFns.createRouteHeader(currYOffset, screenWidth, headerHeight, headerString);
                listGroup.add(item);
                currYOffset += headerHeight;
                matches++;
              }
              var item = DrawFns.createRouteItem(currYOffset, screenWidth, itemHeight, PossibleRoutes[i]);
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
        RouteSelectionScreen.mainLayer.draw();
      if (App.active_screen !== RouteSelectionScreen) {

        App.directions = [];

        transitionScreen(App.active_screen, RouteSelectionScreen, 'SCALE TOP', App.SHORT_DELAY);
      }
    };
  };

  var generateListItemSelectedFunction = function (item, fieldId, route) {
    return function () {
      var listGroup = RouteSelectionScreen.listItemsGroup;
      var fromFieldValue = $('#from-field').val();
      var toFieldValue = $('#to-field').val();
      $(fieldId).val(route.nickname);
     
      
      if($('#from-field').val() === 'Here'){
        $('#from-field').css('color', CURRENT_LOCATION_COLOR);
      }
      else {
        $(fieldId).css('color', NORMAL_FIELD_TEXT_COLOR);
      }
      
      if (fieldId === '#from-field') {
        App.from_route = route;
      } else if (fieldId === '#to-field') {
        App.to_route = route;
      }
      if(fromFieldValue !== '' && toFieldValue !== '') {
        setTimeout(function () {
          var listGroup = RouteSelectionScreen.listItemsGroup;
          listGroup.removeChildren();
          RouteSelectionScreen.mainLayer.draw();
        }, App.SHORT_DELAY);
        //Start Generating Routes
        App.departure_time = App.getCurrentTimeForDeparture();
        computeDirections();
        $(fieldId).blur();
        transitionScreen(RouteSelectionScreen, GraphicalComparisonScreen, 'SCALE TOP', App.SHORT_DELAY);
      }

      if (fieldId == '#from-field') {
        setTimeout(function () {
          var listGroup = RouteSelectionScreen.listItemsGroup;
          listGroup.removeChildren();
          RouteSelectionScreen.mainLayer.draw();
        }, App.SHORT_DELAY);
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
          colorStops: LIST_SELECTED_GRADIENT
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
      RouteSelectionScreen.mainLayer.draw();
    };
  };

  var createGraphicalRouteItemBackground = function (x, y, width, height) {
    var background = new Kinetic.Rect({
      x: x,
      y: y,
      width: width,
      height: height,
      fill: 'white',
      stroke: 'black'
    });
    return background;
  }

  var createGraphicalRouteItem = function (y, width, height, direction, scalingFactor, is_viable) {

    var routeGroup = new Kinetic.Group();

    var arrivalTime = new Date(direction.arrival_time.value);
    var departureTime = new Date(direction.departure_time.value);
    var duration = direction.duration.value;
    var scalingFactor = scalingFactor;
    var waitStep = null;
    var depart = new Date(direction.departure_time.value);
    depart.setSeconds(depart.getSeconds()+direction.steps[0].duration.value);
    var arrival = new Date(direction.steps[1].transit.departure_time.value)
  
    var start = posFromTime(departureTime, App.departure_time, scalingFactor);

    var timeOffset = departureTime;
    var startFlagExists = false;
    for (var stepIdx = 0; stepIdx < direction.steps.length; stepIdx++) {
      var stepColor = UNKNOWN_STEP_COLOR;
      if (direction.steps[stepIdx].travel_mode === "TRANSIT") {
        stepColor = direction.steps[stepIdx].transit.line.color;
        if (direction.steps[stepIdx].transit.line !== undefined && direction.steps[stepIdx].transit.line.vehicle !== undefined) {
          var line = direction.steps[stepIdx].transit.line;
          var vehicleName = line.vehicle.name;
          if (vehicleName === "Bus") {
            stepColor = BUS_STEP_COLOR;
          }
        }
        // XXX: This is a hack. It's not working if the route has a walking step following by a driving step or viceversa'
        if(timeOffset > departureTime) {
          var stepStart = posFromTime(timeOffset, App.departure_time, scalingFactor);
          timeOffset = new Date(direction.steps[stepIdx].transit.departure_time.value);
          var stepEnd = new Date(timeOffset);

          stepEnd.setSeconds(stepEnd.getSeconds());
          stepEnd = posFromTime(stepEnd, App.departure_time, scalingFactor);
          
          waitStep = DrawFns.createWaitStep (y+height/2-10, 20, 3, stepStart, stepEnd, WAIT_TIME_COLOR);
        }
        
        timeOffset = new Date(direction.steps[stepIdx].transit.departure_time.value);
      } else if (direction.steps[stepIdx].travel_mode === "DRIVING") {
        if(stepIdx === 0){
          if(arrival > depart) {
            var stepStart = posFromTime(arrival, App.departure_time, scalingFactor);
            timeOffset = new Date(departureTime+direction.steps[stepIdx].duration.value);
            var stepEnd = new Date(timeOffset);
            
            stepEnd.setSeconds(stepEnd.getSeconds()+direction.steps[stepIdx].duration.value);
            stepEnd = posFromTime(stepEnd, App.departure_time, scalingFactor);
            
            waitStep = DrawFns.createWaitStep (y+height/2-10, 20, 3, stepStart, stepEnd, WAIT_TIME_COLOR);
          }
        }
        stepColor = DRIVING_STEP_COLOR;
      } else if (direction.steps[stepIdx].travel_mode === "WALKING") { 
       if(stepIdx === 0){
          if(arrival > depart) {
            var stepStart = posFromTime(arrival, App.departure_time, scalingFactor);
            timeOffset = new Date(departureTime+direction.steps[stepIdx].duration.value);
            var stepEnd = new Date(timeOffset);
            
            stepEnd.setSeconds(stepEnd.getSeconds()+direction.steps[stepIdx].duration.value);
            stepEnd = posFromTime(stepEnd, App.departure_time, scalingFactor);
            
            waitStep = DrawFns.createWaitStep (y+height/2-10, 20, 3, stepStart, stepEnd, WAIT_TIME_COLOR);
          }
        }
        stepColor = WALKING_STEP_COLOR;
      }

      var firstRounded = (stepIdx === 0);
      var isEnd = (stepIdx === direction.steps.length-1);

      var stepStart = posFromTime(timeOffset, App.departure_time, scalingFactor);

      var stepEnd = new Date(timeOffset);
      stepEnd.setSeconds(stepEnd.getSeconds()+direction.steps[stepIdx].duration.value);
      stepEnd = posFromTime(stepEnd, App.departure_time, scalingFactor);


      if (direction.steps[stepIdx].travel_mode === "TRANSIT") {
        if (startFlagExists === false) {
          var firstTransitTime = direction.steps[stepIdx].transit.departure_time.text;
          if (stepStart < 75){
            var flag = DrawFns.createHiddenStartMessageBubble(stepStart, y+(0.65*height), 40, stepColor, firstTransitTime);
            }
          else if (stepStart >(App.stage.getWidth()-88)){
            var flag = DrawFns.createHiddenMiddleBubble(stepStart, y+(0.65*height), 40, stepColor, firstTransitTime);
          }
          else {
            var flag = DrawFns.createMessageBubble(stepStart, y+(0.65*height), 40, stepColor, firstTransitTime);
            }
          routeGroup.add(flag);
          startFlagExists = true;
        }
      }
      if (isEnd) {
        var endTime = direction.arrival_time.text;
        if (stepEnd > (App.stage.getWidth()-88)){
          var flag = DrawFns.createHiddenEndMessageBubble(stepEnd, y+(0.65*height), 40, stepColor, endTime);
          }
        else{
          var flag = DrawFns.createMessageBubble(stepEnd, y+(0.65*height), 40, stepColor, endTime);
          }
        routeGroup.add(flag);
      }
      var stepLine = DrawFns.createStepLine(stepStart, stepEnd, y+height/2-10, 20, stepColor, firstRounded, isEnd);

      timeOffset.setSeconds(timeOffset.getSeconds()+direction.steps[stepIdx].duration.value);

      if(waitStep !== null){
        routeGroup.add(waitStep);
      }
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
          if (vehicleName === "Train" || vehicleName === "Subway" || vehicleName === "Light rail") {
            icon = DrawFns.createTIcon(iconMid.x-iconSideLength/2, iconMid.y, iconSideLength);
          } else if (vehicleName === "Bus") {
            icon = DrawFns.createBusIcon(iconMid.x-iconSideLength/2, iconMid.y, iconSideLength, stepColor, line.short_name);
          }
        }
      } else if (direction.steps[stepIdx].travel_mode === "WALKING") {
        icon = DrawFns.createWalkingIcon(iconMid.x-iconSideLength/2, iconMid.y, iconSideLength, stepColor);
      } else if (direction.steps[stepIdx].travel_mode === "DRIVING") {
        icon = DrawFns.createCarIcon(iconMid.x-iconSideLength/2, iconMid.y, iconSideLength, stepColor);
      }
      
      if (icon == null) {
        // This means that an appropriate icon doesn't exist yet
        icon = DrawFns.createBusIcon(iconMid.x-iconSideLength/2, iconMid.y, iconSideLength, UNKNOWN_STEP_COLOR, "?");
      }
      routeGroup.add(icon);
    }

    if (!is_viable) {
      var blind = new Kinetic.Rect({
        x: 0,
        y: y,
        width: width,
        height: height,
        fill: 'black',
        opacity: 0.3
      }); 
      routeGroup.add(blind);
    }

    return routeGroup;
  };

  var displayGraphicalRoutes = function () {
    GraphicalComparisonScreen.routeItemsGroup.setPosition({x: 0, y: 0});
    GraphicalComparisonScreen.routeItemsGroup.removeChildren();
    GraphicalComparisonScreen.routeButtonsGroup.removeChildren();
    console.log(App.directions);
    var timeBarHeight = GraphicalComparisonScreen.portraitData.timeBarHeight;
    
    var barStartTime; 
    var earliestDepartureTime = new Date(App.directions[0].departure_time.value);
    for (var i = 0; i < App.directions.length; i++) {
      var direction = App.directions[i];
      var curr_dep_time = new Date(direction.departure_time.value);
      if (curr_dep_time < earliestDepartureTime) {
         earliestDepartureTime = curr_dep_time;
      }
      barStartTime = earliestDepartureTime;
    }
    
    var barEndTime;
    var latestArrivalTime = new Date(App.directions[0].arrival_time.value);
    for (var i = 0; i < App.directions.length; i++) {
      var direction = App.directions[i];
      var curr_arr_time = new Date(direction.arrival_time.value);
      if (curr_arr_time >= latestArrivalTime) {
         latestArrivalTime = curr_arr_time;
      }
      barEndTime = latestArrivalTime;
    }

    var earliestScrollTime = new Date(barStartTime);
    earliestScrollTime.setMinutes(0);
    var latestScrollTime = new Date(barEndTime);
    latestScrollTime.setMinutes(0);
    latestScrollTime.setHours(latestScrollTime.getHours() + 1);

    // Scaling factor is adjusted so that the first route shows up fully
    var firstArrivalTime = new Date(App.directions[0].arrival_time.value);
    var availableScreenSpace = App.stage.getWidth() - GraphicalComparisonScreen.portraitData.routeSelectionButtonWidth;
    var scalingFactor = availableScreenSpace/((firstArrivalTime-App.getCurrentTime())/1000); 
    
    var bg_x = posFromTime(earliestScrollTime, App.departure_time, scalingFactor);
    var bg_end_x = posFromTime(latestScrollTime, App.departure_time, scalingFactor);
    
    var graphicalTimeBar = DrawFns.createGraphicalTimeBar(bg_x, bg_end_x, timeBarHeight,  earliestScrollTime, latestScrollTime, App.departure_time, scalingFactor);

    var bg_width = bg_end_x - bg_x;
    var bg_height = GraphicalComparisonScreen.portraitData.routeItemHeight;
    for (var directionIdx = 0; directionIdx < App.directions.length; directionIdx++) {
      var bg_y = directionIdx*GraphicalComparisonScreen.portraitData.routeItemHeight+timeBarHeight;
      var graphicalRouteItemBg = 
        createGraphicalRouteItemBackground(bg_x, bg_y, bg_width, bg_height);
        GraphicalComparisonScreen.routeItemsGroup.add(graphicalRouteItemBg);
    }

    GraphicalComparisonScreen.routeItemsGroup.add(graphicalTimeBar);

    var linesYOverlapRatio = 1/3;
    var linesY = timeBarHeight*linesYOverlapRatio;
    var linesYOverlap = (1-linesYOverlapRatio)*timeBarHeight;
    var linesHeight = linesYOverlap + App.directions.length * GraphicalComparisonScreen.portraitData.routeItemHeight;
    var linesGroup = DrawFns.createGraphicalIntervalLines(linesY, linesHeight, linesYOverlap, earliestScrollTime, latestScrollTime, App.departure_time, scalingFactor);
    GraphicalComparisonScreen.routeItemsGroup.add(linesGroup);

    for (var directionIdx = 0; directionIdx < App.directions.length; directionIdx++) {
      var direction = App.directions[directionIdx];
      if (direction.is_viable === undefined) {
        direction.is_viable = true;
      }

      var graphicalRouteItem = 
        createGraphicalRouteItem(directionIdx*GraphicalComparisonScreen.portraitData.routeItemHeight+timeBarHeight, App.stage.getWidth(), 
                                 GraphicalComparisonScreen.portraitData.routeItemHeight, direction, scalingFactor, direction.is_viable);
      if (direction.is_viable) {
        var graphicalRouteButton = DrawFns.createGraphicalRouteButton(App.getCanvasWidth()-GraphicalComparisonScreen.portraitData.routeSelectionButtonWidth,
                                     directionIdx*GraphicalComparisonScreen.portraitData.routeItemHeight+timeBarHeight, 
                                     GraphicalComparisonScreen.portraitData.routeSelectionButtonWidth, 
                                     GraphicalComparisonScreen.portraitData.routeItemHeight);
        
        graphicalRouteButton.on('mousedown touchstart', generateRouteIconSelectedFunction(graphicalRouteButton, direction));
        graphicalRouteButton.on('mouseup touchend', generateRouteButtonBounceFunction(graphicalRouteButton, direction));
      }
      
      GraphicalComparisonScreen.routeItemsGroup.add(graphicalRouteItem);
      if (direction.is_viable) {
        GraphicalComparisonScreen.routeButtonsGroup.add(graphicalRouteButton);
      }
    }
    
    GraphicalComparisonScreen.routeItemsGroup.setDraggable("true");

    var min_x = posFromTime(earliestScrollTime, App.departure_time, scalingFactor);
    var max_x = posFromTime(latestScrollTime, App.departure_time, scalingFactor)-App.getCanvasWidth();

    GraphicalComparisonScreen.routeItemsGroup.setDragBoundFunc(function (pos) {
      var x = pos.x;
      x = Math.min(x, -min_x);
      x = Math.max(x, -max_x);
      return {
        x: x,
        y: 0
      };
    });

    GraphicalComparisonScreen.mainLayer.draw();
  };

  var displayDetailedDirections = function () {
    DetailedDirectionsScreen.directionsGroup.removeChildren();
    DetailedDirectionsScreen.arrivalTimeGroup.removeChildren();
    var direction = App.chosen_direction;
    var heightOffset = 0;
    var mapXOffset = 20;
    var mapYOffset = 20;

    var departureTime = new Date(direction.departure_time.value);
    var stepStartTime = departureTime;
    var stepEndTime = new Date(departureTime);
    for (var stepIdx = 0; stepIdx < direction.steps.length; stepIdx++) {
      var step = direction.steps[stepIdx];
      if (step.travel_mode === "WALKING") {
          var mapStartCoord = step.start_location.toString();
          mapStartCoord = mapStartCoord.replace("(", "").replace(")", ""); // strip parens for url
          var mapEndCoord = step.end_location.toString();
          mapEndCoord = mapEndCoord.replace("(", "").replace(")", ""); //strip parens for url
          console.log("start coordinate: " + mapStartCoord.toString());
          console.log("end coordinate: " + mapEndCoord.toString());
          var mapSrc = "http://maps.googleapis.com/maps/api/staticmap?center=" + mapStartCoord + "&zoom=13&size=300x300&maptype=roadmap" +
"&markers=color:blue%7Clabel:A%7C"+ mapStartCoord + "&markers=color:green%7Clabel:B%7C" + mapEndCoord +
"&sensor=false";
          console.log("map url: " + mapSrc);
      }
      if (step.travel_mode === "TRANSIT") {
        stepStartTime = new Date(step.transit.departure_time.value);
      }

      var diff_ms = stepStartTime - stepEndTime;

      var width = App.getCanvasWidth();

      if (diff_ms > App.CONSIDER_THIS_WAIT_TIME_MS) {
        var height = DetailedDirectionsScreen.portraitData.waitDirectionItemHeight;
        var waitStepItem = DrawFns.createDirectionWaitItem(heightOffset, width, height, diff_ms);
        heightOffset += height;
        DetailedDirectionsScreen.directionsGroup.add(waitStepItem);
      } 

      var height = DetailedDirectionsScreen.portraitData.moveDirectionItemHeight;
      var pathBlockWidth = DetailedDirectionsScreen.portraitData.pathBlockWidth;
      var stepItem = DrawFns.createDirectionStepItem(heightOffset, width, height, pathBlockWidth, step, mapXOffset, mapYOffset, mapSrc);
      DetailedDirectionsScreen.mainLayer.draw();
      heightOffset += height;

      stepEndTime = new Date(stepStartTime);
      stepEndTime.setSeconds(stepEndTime.getSeconds()+step.duration.value);
      
      DetailedDirectionsScreen.directionsGroup.add(stepItem);
    }

    DetailedDirectionsScreen.directionsGroup.setDraggable('true');
    DetailedDirectionsScreen.directionsGroup.setDragBoundFunc(function (pos) {
      var y = pos.y;
      var max_y = Math.max(heightOffset - App.getCanvasHeight(), 0);
      y = Math.max(Math.min(y,0), -max_y);
      return {
        x: 0,
        y: y
      };
    });

    var barHeight = DetailedDirectionsScreen.portraitData.arrivalBarHeight;
    var barY = App.getCanvasHeight()-barHeight;
    var barWidth = App.getCanvasWidth();
    var pathBlockWidth = DetailedDirectionsScreen.portraitData.pathBlockWidth;
    var arrivalBar = DrawFns.createArrivalBar(barWidth, barHeight, barY, direction.arrival_time.text, pathBlockWidth);
    DetailedDirectionsScreen.arrivalTimeGroup.add(arrivalBar);

    DetailedDirectionsScreen.mainLayer.draw();
  };

  var displayDelayDesignA = function () {
    // WE ARE NOT USING THIS
    var width = DetailedDirectionsScreen.portraitData.sideBarWidth;
    var y = DetailedDirectionsScreen.portraitData.sideBarYOffset;
    var height = App.getCanvasHeight() - DetailedDirectionsScreen.portraitData.arrivalBarHeight - y*2;
    var sideBar = DrawFns.createSideBar(width, height, y, App.chosen_direction);
    var barWidth = App.getCanvasWidth();
    var barHeight = DetailedDirectionsScreen.portraitData.arrivalBarHeight;
    var barY = App.getCanvasHeight()-barHeight;
    var msgBubble = DrawFns.createPopUpMessageBubble(barWidth*0.15, barY*0.975, barHeight, "Your arrival time has changed!");

    DetailedDirectionsScreen.arrivalTimeGroup.add(msgBubble);
    DetailedDirectionsScreen.arrivalTimeGroup.add(sideBar);
    DetailedDirectionsScreen.mainLayer.draw();
  };

  var displayDelayDesignB = function () {
    // TODO: IMPLEMENT ASAP. This is the one we are using
    App.chosen_direction.is_viable = false;
    App.directions = [App.chosen_direction];
    displayGraphicalRoutes();
    
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

  App.from_route = getFirstRouteWithMatch('Here');

  if (demoTime != null) {
    App.departure_time = demoTime;
  }

  $('#to-field').focus();

  App.heightOffset = $('#top-bar').height();

  //$('#to-field').bind('click', focus-to-field());

 // $('#to-field').bind('touchstart', function() {
   //  $('#to-field').focus();
    //});
    //$('#to-field').trigger('touchstart');
  
  //function focus-to-field() {
    //$('#to-field').focus();
  //}
});
