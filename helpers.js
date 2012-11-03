  // Given a time, what is the x position on the canvas that corresponds to it?
  var posFromTime = function (time, initialTime, scalingFactor) {
    // Convert to seconds and scale by scalingFactor
    return (time - initialTime)/1000 * scalingFactor;
  };

  var millisecondsToHumanString = function (ms) {
    var human;
    var minutes = ms / (1000*60);
    var roundNumber = function (number)
    {
      if(number%5 !== 0){
        number = Math.round(number/5) * 5;
      }
      return number;
    };
    
    if(minutes < 1){
      human = "1 min";
    } else {
      if(minutes <=10 && minutes >=1){
        human = minutes + " min";
      } else {
        if(minutes >= 60){
          human = Math.floor(minutes/60) + " h ";
          if(minutes%60 !== 0)
          { 
            if(roundNumber(Math.round(minutes%60)) === 60){
              human = Math.floor(minutes/60)+1 + " h ";
              console.log(roundNumber(Math.round(minutes%60)));
            } else {
              human += roundNumber(Math.round(minutes%60)) + " min";
              console.log(roundNumber(Math.round(minutes%60)));
            }
          } 
        } else {
           human = roundNumber(minutes) + " min";
          }
        }
      }
    console.log(human);
    return human;
  }
