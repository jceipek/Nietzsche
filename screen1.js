// NOTE: we have global access to all PossibleRoutes and ROUTE_TYPES

$(function() {

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
    // TODO: Implement this.
    if (type !== route.type) {
      return false;
    }
    if (string === '') {
      return false;
    }
    if((route.nickname).search(string) !== -1 
      || (route.name).search(string) !== -1 
      || (route.address).search(string) !== -1 
      || (route.location).search(string) !== -1) {
      return true;
    }
    return false;
  }

  var createRouteHeader = function (y, width, height, headerTitle) {
    //TODO: Finish this by making it a group and adding a title
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
    //TODO: Finish this by making it a group and adding route information
    var group = new Kinetic.Group();
    var background = new Kinetic.Rect({
      x: 0,
      y: y,
      width: width,
      height: height,
      fill: 'white',
      stroke: 'grey',
      strokeWidth: 4
    });
    
    var nickname = new Kinetic.Text({
      x: 0,
      y: y,
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
      y: y+40,
      text: route.name + "\n" + route.address +"\n" + route.location,
      fontSize: 20,
      fontFamily: 'HelveticaNeue',
      textFill: '#555',
      width: width,
      padding: 20,
      align: 'left',
    });

    group.add(background);
    group.add(nickname);
    group.add(routeDetails);            
    return group;
  };

  var generateListItemSelectedFunction = function (item, fieldId, route) {
    return function () {
      var listGroup = screen1.listItemsGroup;
      //listGroup.removeChildren(); // Clear the list
      screen1.shapesLayer.draw();
      var fromFieldValue = $('#from-field').val();
      var toFieldValue = $('#to-field').val();
      $(fieldId).val(route.nickname);
      if(fromFieldValue !== '' && toFieldValue !== '') {
        // TODO: Go to next screen!
        console.log('NEXT SCREEN!');
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

      item.add(selectionRect);
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

});
