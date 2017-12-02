
  var hrs, sesHrs = 0;
  var secs, sesSecs = 0;
  var mins, sesMins = 0;
  var hrsTen  = 0;
  var hrsOne  = 0;
  var minsTen = 0;
  var minsOne = 0;
  var secsTen = 0;
  var secsOne = 0;
  var Interval
  var pause = false;
  var reset = false;
  var isCounting = false;
  var inputTimeDiv = document.getElementById('inputTime');


  hrsTen = document.getElementById("hoursTen").value || '0'
  hrsOne = document.getElementById("hoursOne").value || '0'
  minsTen = document.getElementById("minutesTen").value || '0'
  minsOne = document.getElementById("minutesOne").value || '0'
  secsTen = document.getElementById("secondsTen").value || '0'
  secsOne = document.getElementById("secondsOne").value || '0'

  sesHrs = parseInt(hrsTen+ hrsOne)
  sesMins = parseInt(minsTen + minsOne)
  sesSecs = parseInt(secsTen + secsOne)

  hrs =  parseInt(hrsTen+ hrsOne)
  mins = parseInt(minsTen + minsOne)
  secs = parseInt(secsTen + secsOne)

$("#button-start").click(function(){

  if(isCounting){
    clearInterval(Interval);
    isCounting = false;
    document.getElementById('play').classList.remove('fa-pause-circle')
    document.getElementById('play').classList.add('fa-play-circle')
    console.log(mins);
  }else{

    if(reset){

      hrsTen = document.getElementById("hoursTen").value || '0'
      hrsOne = document.getElementById("hoursOne").value || '0'
      minsTen = document.getElementById("minutesTen").value || '0'
      minsOne = document.getElementById("minutesOne").value || '0'
      secsTen = document.getElementById("secondsTen").value || '0'
      secsOne = document.getElementById("secondsOne").value || '0'

      sesHrs = parseInt(hrsTen+ hrsOne)
      sesMins = parseInt(minsTen + minsOne)
      sesSecs = parseInt(secsTen + secsOne)
      //console.log(hrsTen, hrsOne)

    }

      //if no value entered alert user
      if(!hrs && !mins && !secs){
        alert("Please enter a time...")

      }
      else{
        isCounting = true;

        setDisplay();
        swapContent('showTime')

        removeLabels('labels')

        document.getElementById('play').classList.remove('fa-play-circle')
        document.getElementById('play').classList.add('fa-pause-circle')

         //clearInterval(Interval);
         Interval = setInterval(startTimer, 1000)
       }

  }


})

  function removeLabels(labels){
    const labelDiv = document.getElementById(labels)
      labelDiv.style.display = 'none';
  }

  function addLabels(labels){
    const labelDiv = document.getElementById(labels)
      labelDiv.style.display = 'block';
  }

  function swapContent(id) {

      const main = document.getElementById('main');
      const div = document.getElementById(id);
      const clone = div.cloneNode(true);
      clone.style.display = 'block'

      while (main.firstChild) main.firstChild.remove();

      main.appendChild(clone);

  }




$("#button-stop").click(function(){
  clearInterval(Interval);
  pause = true;
  console.log(pause)
})

$("#button-reset").click(function(){
  clearInterval(Interval);
  reset = true;

  hrs = sesHrs
  mins = sesMins
  secs = sesSecs


  setDisplay()
  swapBack('inputTime')
  addLabels('labels')
//  swapContent('showTime','mainDiv')
})

function swapBack(id){
  const main = document.getElementById('main');
  const div = document.getElementById(id);
  const clone = div.cloneNode(true);
  clone.style.display = 'block'

  while (main.firstChild) main.firstChild.remove();

  main.appendChild(clone);
}

$("#button-done").click(function(){
  clearInterval(Interval);
  pause = true;

  //get values in seconds
  let diffHrs = (sesHrs - hrs)*60*60;
  let diffMins= (sesMins - mins)*60;
  let diffSecs = sesSecs - secs;
  convertToMins(diffHrs,diffMins,diffSecs)

})

function convertToMins(hrs,mins,secs){
  let totalSecs = hrs+mins+secs
  console.log(Math.floor(totalSecs/60))
}

$("#button-clear").click(function(){
  pause = false;
  reset = false;
  clearInterval(Interval);
  hrs =  0
  mins = 0
  secs = 0
  setDisplay()

  if (inputTimeDiv.style.display === 'none') {
        inputTimeDiv.style.display = 'block';
    }
})

function startTimer () {

    if(secs==00 && mins==00 && hrs==00){
      alert("Times up")
      clearInterval(Interval);
    }

    else{
      if(secs>0){
        secs --;
      }
      else{
        if(mins>0){
          secs=59;
          mins--;
        }
        else{
          if(hrs>0){
            secs=59
            mins=59
            hrs--;
          }
        }
      }

    }

  setDisplay()

}


  function setDisplay(){

    if(secs < 10){
    document.getElementById('showsecs').innerHTML = "0" + secs
  }
  else{
    document.getElementById('showsecs').innerHTML = secs
  }


  if(mins<10){
    document.getElementById('showmins').innerHTML = "0"+ mins;
 }
 else{
    document.getElementById('showmins').innerHTML = mins
  }

  if(hrs<10){
    document.getElementById('showhrs').innerHTML = "0"+ hrs;
 }
 else{
    document.getElementById('showhrs').innerHTML = hrs
  }

  }
