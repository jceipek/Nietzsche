define(function () {

  var App = {
      use_simulated_data: false, //Do we use Google Maps or some cached data?
      design_A: false, // Do we use Design A? if not, use Design B
      simulate_delay: false, // Whether to simulate route change introducing delay
      from_route: null,
      to_route: null,
      active_screen: null,
      departure_time: null,
      _real_departure_time: null,
      directions: [],
      chosen_direction: null,
      CONSIDER_THIS_WAIT_TIME_MS: 5000,
      SHORT_DELAY: 200,
      MEDIUM_DELAY: 300,
      MIN_TIME_UNTIL_SIMULATED_DELAY: 5000,
      MAX_TIME_UNTIL_SIMULATED_DELAY: 7000,
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

    App.isDesignA = function () {
      return App.design_A;
    }

    App.isDesignB = function () {
      return !App.design_A;
    }

    App.getCurrentTimeForDeparture = function () {
      App._real_departure_time = new Date();
      if (App.use_simulated_data) {
        return new Date(1354139548000);
      } else {
        return App._real_departure_time;
      }
    };

    App.getCurrentTime = function () {
      if (App.use_simulated_data) {
        c = new Date(1354139548000);
        c.setMilliseconds(c.getMilliseconds()+(new Date() - App._real_departure_time));
        return c;
      } else {
        return new Date();
      }
    }

  return App;
});
