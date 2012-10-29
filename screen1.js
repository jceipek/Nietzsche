// NOTE: we have global access to all PossibleRoutes and ROUTE_TYPES

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
        Application.departure_time = new Date();
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
    
    var group = new Kinetic.Group();
    var background = new Kinetic.Rect({
      x: 0,
      y: y,
      width: width,
      height: height,
      fill: 'white',
      stroke: 'black'
    });

    var scalingFactor = 0.1;
    var departureTime = new Date(direction.departure_time.value);
    var duration = direction.duration.value;
    var start = posFromTime(departureTime, Application.departure_time, scalingFactor);

    var fakeRoute = new Kinetic.Rect({
      x: start+10,
      y: y+height/2-10,
      width: duration*scalingFactor,
      height: 20,
      fill: 'blue'
    });

    group.add(background);
    group.add(fakeRoute);
    return group;
  };

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

  $('#to-field').focus();

});
