// NOTE: we have global access to all PossibleRoutes and ROUTE_TYPES

$(function() {

  var Application = {
    from_route: null,
    to_route: null
  };

  var screen1 = {
    portraitData: {
      listHeaderHeight: 40,
      listItemHeight: 150
    },
    stage: new Kinetic.Stage({
            container: 'screen1Container',
            width: 640,
            height: 940}),
    shapesLayer: new Kinetic.Layer(),
    listItemsGroup: new Kinetic.Group()
  };
  screen1.stage.add(screen1.shapesLayer);
  screen1.shapesLayer.add(screen1.listItemsGroup);

  // Given a route and a search string, indicates whether the route is
  //   matches the string.
  var routeMatchesStringFilter = function (route, string, type) {
    string = string.toLowerCase()
    if (type !== route.type) {
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
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: 'white',
      stroke: 'grey',
      strokeWidth: 4
    });

    var nickname = new Kinetic.Text({
      x: 0,
      y: 0,
      text: route.nickname,
      fontSize: 24,
      fontFamily: 'HelveticaNeue-Medium',
      textFill: '#000',
      width: width,
      padding: 20,
      align: 'left'
    });

    var routeDetails = new Kinetic.Text({
      x: 0,
      y: 40,
      text: route.name + "\n" + route.address +"\n" + route.location,
      fontSize: 20,
      fontFamily: 'HelveticaNeue',
      textFill: '#555',
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
      var listGroup = screen1.listItemsGroup;
      var fromFieldValue = $('#from-field').val();
      var toFieldValue = $('#to-field').val();
      $(fieldId).val(route.nickname);
      if (fieldId === '#from-field') {
        Application.from_route = route;
      } else if (fieldId === '#to-field') {
        Application.to_route = route;
      }
      if(fromFieldValue !== '' && toFieldValue !== '') {
        // TODO: Go to next screen!
        console.log('NEXT SCREEN!');
      }

      if (fieldId == '#from-field') {
        $('#to-field').focus()
      }

      var selectionRect = new Kinetic.Rect({
        x: 0,
        y: 0,
        width: item.getWidth(),
        height: item.getHeight(),
        fill: 'blue',
        stroke: 'grey',
        strokeWidth: 4
      });

      //item.add(selectionRect);

      //screen1.shapesLayer.draw();
    };
  };

  var generateSearchFieldFunction = function (fieldId) {
    return function () {
      var currentValue = $(fieldId).val();
      var screenWidth = screen1.stage.getWidth();
      var screenHeight = screen1.stage.getHeight();
      var itemHeight = screen1.portraitData.listItemHeight;
      var headerHeight = screen1.portraitData.listHeaderHeight;
      var listGroup = screen1.listItemsGroup;

      console.log(currentValue);
      listGroup.removeChildren(); // Clear the list

      listGroup.setDraggable('true');
      listGroup.setPosition(0,0);

      var currYOffset = 0;
      for (var routeTypeIdx=0; routeTypeIdx < ROUTE_TYPES.length; routeTypeIdx++) {
        var headerString = ROUTE_TYPES[routeTypeIdx];
        var matches = 0;
        for (var i=0; (i < PossibleRoutes.length && currYOffset < screenHeight); i++) {
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
      screen1.shapesLayer.draw();
    };
  };

  $('#screen-wrapper').bind('touchmove', function (e) {
    e.preventDefault();
  });
  $('#screen-wrapper').bind('touchmove', function (e) {
    e.preventDefault();
  });
  $('#from-field').keyup(generateSearchFieldFunction('#from-field'));
  $('#to-field').keyup(generateSearchFieldFunction('#to-field'));

  $('#to-field').focus();

});
