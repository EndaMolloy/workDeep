
  var hrs, sesHrs = 0;
  var secs, sesSecs = 0;
  var mins, sesMins = 0;
  var hrsTen  = 0;
  var hrsOne  = 0;
  var minsTen = 0;
  var minsOne = 0;
  var secsTen = 0;
  var secsOne = 0;
  let sessHrsTen
  let sessHrsOne
  let sessMinsTen
  let sessMinsOne
  let sessSecsTen
  let sessSecsOne

  var Interval
  var pause = false;
  var reset = false;
  var isCounting = false;
  const inputBoxes = document.getElementsByTagName('input')
  const labelDiv = document.getElementById('labels')

  hrsTen = document.getElementById("hoursTen").value || '0'
  hrsOne = document.getElementById("hoursOne").value || '0'
  minsTen = document.getElementById("minutesTen").value || '0'
  minsOne = document.getElementById("minutesOne").value || '0'
  secsTen = document.getElementById("secondsTen").value || '0'
  secsOne = document.getElementById("secondsOne").value || '0'

  sessHrsTen  = hrsTen;
  sessHrsOne  = hrsOne;
  sessMinsTen = minsTen;
  sessMinsOne = minsOne;
  sessSecsTen = secsTen;
  sessSecsOne = secsOne;


  for(let i=0; i<inputBoxes.length; i++){
    inputBoxes[i].addEventListener('change',(ev)=>{
      hrsTen = document.getElementById("hoursTen").value || '0'
      hrsOne = document.getElementById("hoursOne").value || '0'
      minsTen = document.getElementById("minutesTen").value || '0'
      minsOne = document.getElementById("minutesOne").value || '0'
      secsTen = document.getElementById("secondsTen").value || '0'
      secsOne = document.getElementById("secondsOne").value || '0'

      sessHrsTen  = hrsTen;
      sessHrsOne  = hrsOne;
      sessMinsTen = minsTen;
      sessMinsOne = minsOne;
      sessSecsTen = secsTen;
      sessSecsOne = secsOne;
    })
  }

  sessHrs = parseInt(hrsTen+ hrsOne)
  sesMins = parseInt(minsTen + minsOne)
  sesSecs = parseInt(secsTen + secsOne)

  hrs =  parseInt(hrsTen+ hrsOne)
  mins = parseInt(minsTen + minsOne)
  secs = parseInt(secsTen + secsOne)

$("#button-start").click(function(){

  console.log(sessMinsTen,sessMinsOne);
  if(isCounting){
    clearInterval(Interval);
    isCounting = false;
    document.getElementById('play').classList.remove('fa-pause-circle')
    document.getElementById('play').classList.add('fa-play-circle')

  }else{
      //if no value entered alert user
      if(!hrs && !mins && !secs){
        alert("Please enter a time...")

      }
      else{

          hrsTen = document.getElementById("hoursTen").value || '0'
          hrsOne = document.getElementById("hoursOne").value || '0'
          minsTen = document.getElementById("minutesTen").value || '0'
          minsOne = document.getElementById("minutesOne").value || '0'
          secsTen = document.getElementById("secondsTen").value || '0'
          secsOne = document.getElementById("secondsOne").value || '0'

          hrs =  parseInt(hrsTen+ hrsOne)
          mins = parseInt(minsTen + minsOne)
          secs = parseInt(secsTen + secsOne)

        isCounting = true;

        setDisplay();
        modifyInputField()


        document.getElementById('play').classList.remove('fa-play-circle')
        document.getElementById('play').classList.add('fa-pause-circle')

        //console.log(hrs,mins,secs)
         //clearInterval(Interval);
         Interval = setInterval(startTimer, 1000)
       }

  }


})



  function modifyInputField(){

    if(reset){
      labelDiv.style.color = 'black';

      for(let i=0; i<inputBoxes.length; i++){
        inputBoxes[i].style['border-bottom']='1.5px solid black';
        inputBoxes[i].disabled = false;
      }
    }
    else{
      labelDiv.style.color = 'white';

      for(let i=0; i<inputBoxes.length; i++){
        inputBoxes[i].style['border-bottom']='none';
        inputBoxes[i].disabled = true;
      }
    }
  }

  function addLabels(){
      labelDiv.style.color = 'black';
  }

  function resetValues(){
    hrsTen = sessHrsTen
    hrsOne =  sessHrsOne
    minsTen = sessMinsTen
    minsOne = sessMinsOne
    secsTen = sessSecsTen
    secsOne = sessSecsOne
  }


$("#button-reset").click(function(){
  reset = true;
  clearInterval(Interval);
  resetValues()
  setDisplay()

})



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

  reset = true;
  clearInterval(Interval);

  resetValues()
  setDisplay()
  addLabels()
  modifyInputField()
  reset = false;

})

function startTimer () {

    if(secs==00 && mins==00 && hrs==00){
      alert("Times up")
      clearInterval(Interval);
    }
    else{
      if(secsOne>0){
        secsOne --;
      }
      else{
        if(secsTen>0){
          secsOne=9;
          secsTen--;
        }
        else{
          if(minsOne>0){
            secsOne=9
            secsTen=5;
            minsOne--;
          }
          else{
            if(minsTen>0){
              secsOne=9
              secsTen=5;
              minsOne=9
              minsTen--;
            }
            else{
              if(hrsOne>0){
                secsOne=9
                secsTen=5;
                minsOne=9
                minsTen=5
                hrsOne--;
              }
              else{
                if(hrsTen>0){
                  secsOne=9
                  secsTen=5;
                  minsOne=9
                  minsTen=5
                  hrsOne=9
                  hrsTen--;
                }
              }
            }
          }
        }
      }
    }

  setDisplay()

}


  function setDisplay(){

    document.getElementById('secondsOne').value = secsOne;
    document.getElementById('secondsTen').value = secsTen;
    document.getElementById("minutesTen").value = minsTen;
    document.getElementById("minutesOne").value = minsOne;
    document.getElementById("hoursTen").value = hrsTen;
    document.getElementById("hoursOne").value = hrsOne;


  }
