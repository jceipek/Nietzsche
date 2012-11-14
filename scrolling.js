$(document).ready(function() {
	            $.waypoints.settings.scrollThrottle = 30;
	            $('#wrapper').waypoint(function(event, direction) {
		            offset: '0px'
	            }).find('#sidebar').waypoint(function(event, direction) {
		            $(this).parent().toggleClass('sticky', direction === "down");
		        event.stopPropagation();
	            });
            });