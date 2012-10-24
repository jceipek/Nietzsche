// NOTE: we have global access to all PossibleRoutes and ROUTE_TYPES

$(function() {

  var screen1 = {
    portraitData: {
      listHeaderHeight: 40,
      listItemHeight: 80
    },
    stage: new Kinetic.Stage({
            container: 'screen1Container',
            width: 640,
            height: 940}),
    shapesLayer: new Kinetic.Layer(),
    listItemsGroup: new Kinetic.Group()
    //messageLayer: new Kinetic.Layer()
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
    var group = new Kinetic.Rect({
      x: 0,
      y: y,
      width: width,
      height: height,
      fill: 'green',
      align:"center",
      stroke: 'black',
      strokeWidth: 4
    });

    return group;
  };

  var createRouteItem = function (y, width, height, route) {
    //TODO: Finish this by making it a group and adding route information
    var group = new Kinetic.Rect({
      x: 0,
      y: y,
      width: width,
      height: height,
      fill: 'white',
      align:"center",
      stroke: 'black',
      strokeWidth: 4
    });
    return group;
  };

  $('#to-field').keyup(function(){
    var currentValue = $('#to-field').val();
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
          listGroup.add(item);
          currYOffset += itemHeight;
        } 
      }
    }
    screen1.shapesLayer.draw();
  });

});
