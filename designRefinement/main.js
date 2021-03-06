// NOTE: we have global access to all PossibleRoutes and ROUTE_TYPES
var demoTime = null;
//demoTime = new Date(1351774692398); // Comment this out if we want to use the current time.

var ROUTE_SELECTION_SCREEN_BG_COLOR = '#eee';
var GRAPHICAL_COMPARISON_SCREEN_BG_COLOR = '#eee';
var DETAILED_DIRECTIONS_SCREEN_BG_COLOR = '#eee';

$(function() {

  var Application = {
    from_route: null,
    to_route: null,
    active_screen: null,
    departure_time: new Date(),
    directions: [],
    chosen_direction: null,
    CONSIDER_THIS_WAIT_TIME_MS: 5000,
    SHORT_DELAY: 200,
    MEDIUM_DELAY: 300,
    heightOffset: 0,
    stage: new Kinetic.Stage({
      container: 'screenContainer',
      width: 640,
      height: 940})
  };

  Application.getCanvasWidth = function () {
    return Application.stage.getWidth();
  };

  Application.getCanvasHeight = function () {
    return Application.stage.getHeight() - Application.heightOffset;
  };

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
      width: Application.getCanvasWidth(),
      height: Application.stage.getHeight(),
      fill: ROUTE_SELECTION_SCREEN_BG_COLOR
    })
  };
  
  RouteSelectionScreen.mainLayer.add(RouteSelectionScreen.background);
  RouteSelectionScreen.mainLayer.add(RouteSelectionScreen.listItemsGroup);
  Application.active_screen = RouteSelectionScreen;

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
      width: Application.getCanvasWidth(),
      height: Application.stage.getHeight(),
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
      arrivalBarHeight: 40,
      pathBlockWidth: 50
    },
    mainLayer: new Kinetic.Layer(),
    arrivalTimeGroup: new Kinetic.Group(),
    directionsGroup: new Kinetic.Group(),
    background: new Kinetic.Rect({
      x: 0,
      y: 0,
      width: Application.getCanvasWidth(),
      height: Application.stage.getHeight(),
      fill: DETAILED_DIRECTIONS_SCREEN_BG_COLOR
    })
  };

/*  DetailedDirectionsScreen.staticImage.src = "detailedDirectionsScreen.png";
  DetailedDirectionsScreen.staticImage.onload = function () {
    DetailedDirectionsScreen.background.setImage(DetailedDirectionsScreen.staticImage);
  };*/
  DetailedDirectionsScreen.mainLayer.add(DetailedDirectionsScreen.background);
  DetailedDirectionsScreen.mainLayer.add(DetailedDirectionsScreen.directionsGroup);
  DetailedDirectionsScreen.mainLayer.add(DetailedDirectionsScreen.arrivalTimeGroup);
  DetailedDirectionsScreen.mainLayer.hide();

  Application.stage.add(DetailedDirectionsScreen.mainLayer);
  Application.stage.add(GraphicalComparisonScreen.mainLayer);
  Application.stage.add(RouteSelectionScreen.mainLayer);


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
      Application.heightOffset = $('#top-bar').height();
      Application.active_screen = endScreen;
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
            Application.getCanvasWidth()/2,
            Application.stage.getHeight()/2            
          );
          startScreen.mainLayer.setOffset(
            Application.getCanvasWidth()/2,
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
        finalize();
        /* END RESET */
      }, time);
    } else if (transition === 'SLIDE LEFT') {
      endScreen.mainLayer.moveToTop();
      startScreen.mainLayer.moveToBottom();
      endScreen.mainLayer.setPosition(Application.getCanvasWidth(), 0);
      endScreen.mainLayer.show();

      var anim = new Kinetic.Animation({
        func: function(frame) {
          var fractionComplete = frame.time/time;
          fractionComplete = Math.min(fractionComplete, 1);
          fractionComplete = Math.max(fractionComplete, 0);
          var width = Application.getCanvasWidth();

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
        finalize();
        /* END RESET */
      }, time);
    }
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
      Application.chosen_direction = direction;
      displayDetailedDirections();
      transitionScreen(GraphicalComparisonScreen, DetailedDirectionsScreen, 'SLIDE LEFT', Application.MEDIUM_DELAY);
      console.log('To the detailed directions screen!');
    }
  };

  var generateSearchFieldFunction = function (fieldId) {
    return function () {
      var currentValue = $(fieldId).val();
      var screenWidth = Application.getCanvasWidth();
      var screenHeight = Application.stage.getHeight();
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
        RouteSelectionScreen.mainLayer.draw();
      if (Application.active_screen !== RouteSelectionScreen) {

        Application.directions = [];

        transitionScreen(Application.active_screen, RouteSelectionScreen, 'SCALE TOP', Application.SHORT_DELAY);
      }
    };
  };

  var generateListItemSelectedFunction = function (item, fieldId, route) {
  return function () {
    var listGroup = RouteSelectionScreen.listItemsGroup;
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
        var listGroup = RouteSelectionScreen.listItemsGroup;
        listGroup.removeChildren();
        RouteSelectionScreen.mainLayer.draw();
      }, Application.SHORT_DELAY);
        //Start Generating Routes
        if (demoTime == null) {
          Application.departure_time = new Date();
        }
        computeDirections();
        $(fieldId).blur();
        transitionScreen(RouteSelectionScreen, GraphicalComparisonScreen, 'SCALE TOP', Application.SHORT_DELAY);
      }

      if (fieldId == '#from-field') {
        setTimeout(function () {
          var listGroup = RouteSelectionScreen.listItemsGroup;
          listGroup.removeChildren();
          RouteSelectionScreen.mainLayer.draw();
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

  var createGraphicalRouteItem = function (y, width, height, direction, scalingFactor) {

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

    var arrivalTime = new Date(direction.arrival_time.value);
    var departureTime = new Date(direction.departure_time.value);
    var duration = direction.duration.value;
    var scalingFactor = scalingFactor;

  
    var start = posFromTime(departureTime, Application.departure_time, scalingFactor);

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
        timeOffset = new Date(direction.steps[stepIdx].transit.departure_time.value);
      } else if (direction.steps[stepIdx].travel_mode === "DRIVING") {
        stepColor = DRIVING_STEP_COLOR;
      } else if (direction.steps[stepIdx].travel_mode === "WALKING") { 
        stepColor = WALKING_STEP_COLOR;
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
          if (stepStart < 75){
            var flag = createHiddenStartMessageBubble(stepStart, y+(0.65*height), 40, stepColor, firstTransitTime);
            }
          else if (stepStart >(Application.stage.getWidth()-88)){
            var flag = createHiddenMiddleBubble(stepStart, y+(0.65*height), 40, stepColor, firstTransitTime);
          }
          else {
            var flag = createMessageBubble(stepStart, y+(0.65*height), 40, stepColor, firstTransitTime);
            }
          routeGroup.add(flag);
          startFlagExists = true;
        }
      }
      if (isEnd) {
        var endTime = direction.arrival_time.text;
        if (stepEnd > (Application.stage.getWidth()-88)){
          var flag = createHiddenEndMessageBubble(stepEnd, y+(0.65*height), 40, stepColor, endTime);
          }
        else{
          var flag = createMessageBubble(stepEnd, y+(0.65*height), 40, stepColor, endTime);
          }
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
          if (vehicleName === "Train" || vehicleName === "Subway" || vehicleName === "Light rail") {
            icon = createTIcon(iconMid.x-iconSideLength/2, iconMid.y, iconSideLength);
          } else if (vehicleName === "Bus") {
            icon = createBusIcon(iconMid.x-iconSideLength/2, iconMid.y, iconSideLength, stepColor, line.short_name);
          }
        }
      } else if (direction.steps[stepIdx].travel_mode === "WALKING") {
        icon = createWalkingIcon(iconMid.x-iconSideLength/2, iconMid.y, iconSideLength, stepColor);
      } else if (direction.steps[stepIdx].travel_mode === "DRIVING") {
        icon = createCarIcon(iconMid.x-iconSideLength/2, iconMid.y, iconSideLength, stepColor);
      }
      
      if (icon == null) {
        // This means that an appropriate icon doesn't exist yet
        icon = createBusIcon(iconMid.x-iconSideLength/2, iconMid.y, iconSideLength, UNKNOWN_STEP_COLOR, "?");
      }
      routeGroup.add(icon);
    }

    return routeGroup;
  };

  var displayGraphicalRoutes = function () {
    console.log(Application.directions);
    var timeBarHeight = GraphicalComparisonScreen.portraitData.timeBarHeight;
    
    var barStartTime; 
    var earliestDepartureTime = new Date(Application.directions[0].departure_time.value);
    for (var i = 0; i < Application.directions.length; i++) {
      if (Application.directions[i].departure_time < earliestDepartureTime) {
         earliestDepartureTime = Application.directions[i].departure_time;
      }
      barStartTime = earliestDepartureTime;
    }
    
    var barEndTime;
    var latestArrivalTime = new Date(Application.directions[0].arrival_time.value);
    for (var i = 0; i < Application.directions.length; i++) {
      if (Application.directions[i].arrival_time >= latestArrivalTime) {
         latestArrivalTime = Application.directions[i].arrival_time;
      }
      barEndTime = latestArrivalTime;
    }

    var firstArrivalTime = new Date(Application.directions[0].arrival_time.value);
    var availableScreenSpace = Application.stage.getWidth() - GraphicalComparisonScreen.portraitData.routeSelectionButtonWidth;
    var scalingFactor = availableScreenSpace/((firstArrivalTime-(new Date()))/1000); 
    
    for (var directionIdx = 0; directionIdx < Application.directions.length; directionIdx++) {
      var direction = Application.directions[directionIdx];
      var graphicalTimeBar = createGraphicalTimeBar(Application.getCanvasWidth(), timeBarHeight, barStartTime, barEndTime, scalingFactor); // L TODO: fix
      var graphicalRouteItem = 
        createGraphicalRouteItem(directionIdx*GraphicalComparisonScreen.portraitData.routeItemHeight+timeBarHeight, Application.stage.getWidth(), 
                                 GraphicalComparisonScreen.portraitData.routeItemHeight, direction, scalingFactor);
      var graphicalRouteButton = createGraphicalRouteButton(Application.getCanvasWidth()-GraphicalComparisonScreen.portraitData.routeSelectionButtonWidth,
                                   directionIdx*GraphicalComparisonScreen.portraitData.routeItemHeight+timeBarHeight, 
                                   GraphicalComparisonScreen.portraitData.routeSelectionButtonWidth, 
                                   GraphicalComparisonScreen.portraitData.routeItemHeight);
      
      graphicalRouteButton.on('mousedown touchstart', generateRouteIconSelectedFunction(graphicalRouteButton, direction));
      GraphicalComparisonScreen.routeItemsGroup.add(graphicalTimeBar);
      GraphicalComparisonScreen.routeItemsGroup.add(graphicalRouteItem);
      GraphicalComparisonScreen.routeButtonsGroup.add(graphicalRouteButton);
    }
    GraphicalComparisonScreen.mainLayer.draw();
  };

  var displayDetailedDirections = function () {
    var direction = Application.chosen_direction;
    var heightOffset = 0;
    var departureTime = new Date(direction.departure_time.value);
    var stepStartTime = departureTime;
    var stepEndTime = new Date(departureTime);
    for (var stepIdx = 0; stepIdx < direction.steps.length; stepIdx++) {
      var step = direction.steps[stepIdx];

      if (step.travel_mode === "TRANSIT") {
        stepStartTime = new Date(step.transit.departure_time.value);
      }

      var diff_ms = stepStartTime - stepEndTime;

      var width = Application.getCanvasWidth();

      if (diff_ms > Application.CONSIDER_THIS_WAIT_TIME_MS) {
        var height = DetailedDirectionsScreen.portraitData.waitDirectionItemHeight;
        var waitStepItem = createDirectionWaitItem(heightOffset, width, height, diff_ms);
        heightOffset += height;
        DetailedDirectionsScreen.directionsGroup.add(waitStepItem);
      } 

      var height = DetailedDirectionsScreen.portraitData.moveDirectionItemHeight;
      var pathBlockWidth = DetailedDirectionsScreen.portraitData.pathBlockWidth;
      var stepItem = createDirectionStepItem(heightOffset, width, height, pathBlockWidth, step);
      heightOffset += height;

      stepEndTime = new Date(stepStartTime);
      stepEndTime.setSeconds(stepEndTime.getSeconds()+step.duration.value);
      
      DetailedDirectionsScreen.directionsGroup.add(stepItem);
    }
    var barHeight = DetailedDirectionsScreen.portraitData.arrivalBarHeight;
    var barY = Application.getCanvasHeight()-barHeight;
    var barWidth = Application.getCanvasWidth();
    var arrivalBar = createArrivalBar(barWidth, barHeight, barY, direction.arrival_time.text);
    DetailedDirectionsScreen.arrivalTimeGroup.add(arrivalBar);

    DetailedDirectionsScreen.mainLayer.draw();
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

  Application.heightOffset = $('#top-bar').height();

  //$('#to-field').bind('click', focus-to-field());

 // $('#to-field').bind('touchstart', function() {
   //  $('#to-field').focus();
    //});
    //$('#to-field').trigger('touchstart');
  
  //function focus-to-field() {
    //$('#to-field').focus();
  //}

});
