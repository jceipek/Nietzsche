// NOTE: we have global access to all PossibleRoutes and ROUTE_TYPES

$(function() {

  var screen1 = {
    portraitData: {
      listHeaderHeight: 30,
      listItemHeight: 90
    },
    stage: new Kinetic.Stage({
            container: 'screen1Container',
            width: 320,
            height: 470}),
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
    return true;
  }

  var createRouteHeader = function (y, width, height, headerTitle) {
    //TODO: Finish this by making it a group and adding a title
    var group = new Kinetic.Group();
    var routeHeader = new Kinetic.Text({
          x: 0,
          y: y,
          stroke: '#555',
          strokeWidth: 2,
          fill: '#555',
          text: headerTitle,
          fontSize: 14,
          fontFamily: 'HelveticaNeue',
          textFill: '#FFF',
          width: width,
          height: height,
          padding: 5,
          align: 'left',
          //fontStyle: 'italic'
        });
    group.add(routeHeader);

    return group;
  };

  var createRouteItem = function (y, width, height, route) {
    //TODO: Finish this by making it a group and adding route information
    var group = new Kinetic.Group();
    var rectItem = new Kinetic.Rect({
        x: 0,
        y: y,
        width: width,
        height: height,
        fill: 'white',
        stroke: 'grey',
        strokeWidth: 2
    });
    
    var routeItem = new Kinetic.Text({
          x: 0,
          y: y,
          text: route.nickname,
          fontSize: 12,
          fontFamily: 'HelveticaNeue',
          textFill: '#000',
          width: width,
          padding: 20,
          align: 'left',
          fontStyle: 'bold'
        });
        
        var routeItemDetails = new Kinetic.Text({
          x: 0,
          y: y+20,
          text: route.name + "\n" + route.address +"\n" + route.location,
          fontSize: 10,
          fontFamily: 'HelveticaNeue',
          textFill: '#555',
          width: width,
          padding: 20,
          align: 'left',
        });
         group.add(rectItem);
        group.add(routeItem);
        group.add(routeItemDetails);
       
                
        return group;
  };

  var generateListItemSelectedFunction = function (fieldId, route) {
    return function () {
      var listGroup = screen1.listItemsGroup;
      listGroup.removeChildren(); // Clear the list
      screen1.shapesLayer.draw();
      var fromFieldValue = $('#from-field').val();
      var toFieldValue = $('#to-field').val();
      $(fieldId).val(route.nickname);
      if(fromFieldValue !== '' && toFieldValue !== '') {
        // TODO: Go to next screen!
        console.log('NEXT SCREEN!');
      }
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
            item.on('click', generateListItemSelectedFunction(fieldId, PossibleRoutes[i]));
            listGroup.add(item);
            currYOffset += itemHeight;
          }
        }
      }
      screen1.shapesLayer.draw();
    };
  };

  $('#from-field').keyup(generateSearchFieldFunction('#from-field'));
  $('#to-field').keyup(generateSearchFieldFunction('#to-field'));

});
