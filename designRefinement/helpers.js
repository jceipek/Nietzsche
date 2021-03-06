   // Given a Date object, returns a string in a standard format such as "3:00 PM"
  var formatTime = function (time) {
    var amPM = 'AM';
    if (hours >= 12) {
      amPM = 'PM';
    }
    var hours = (time.getHours()%12);
    if (hours === 0) {
      hours = 12;
    }
    var minutes = time.getMinutes();
    if (minutes === 0) {
      minutes = '00';
    } else{
      if(minutes > 0 && minutes < 10)
        minutes = '0' + minutes;
    }
    return hours+':'+minutes+' '+amPM;
  };

  // Given a time, what is the x position on the canvas that corresponds to it?
  var posFromTime = function (time, initialTime, scalingFactor) {
    // Convert to seconds and scale by scalingFactor
    return (time - initialTime)/1000 * scalingFactor;
  };

  var millisecondsToHumanString = function (ms) {
    var human;
    var minutes = ms / (1000*60);
    var roundNumber = function (number){
      if(number%5 !== 0){
        number = Math.round(number/5) * 5;
      }
      return number;
    };
    var checkHour = function(h){
      if(h > 1){
        return " hours ";
      }
      else{
        return " hour ";
      }
    }
    if(minutes < 1){
      human = "1 min";
    } else {
      if(minutes <=10 && minutes >=1){
        human = Math.round(minutes) + " min";
      } else {
        if(minutes >= 60){
          human = Math.floor(minutes/60) + checkHour(Math.floor(minutes/60));
          if(minutes%60 !== 0)
          { 
            if(roundNumber(Math.round(minutes%60)) === 60){
              human = Math.floor(minutes/60)+ 1 + checkHour(Math.floor(minutes/60)+ 1);
            } else {
              human += roundNumber(Math.round(minutes%60)) + " min";
            }
          } 
        } else {
          human = roundNumber(minutes) + " min";
        }
      }
    }
    return human;
  }
