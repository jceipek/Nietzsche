define(function () {

  var App = {
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
        height: 920})
    };

    App.getCanvasWidth = function () {
      return App.stage.getWidth();
    };

    App.getCanvasHeight = function () {
      return App.stage.getHeight() - App.heightOffset;
    };

  return App;
});