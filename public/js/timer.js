
	$(".scroll").click(function(event){
    console.log(event);
		event.preventDefault();
		$("html,body").animate({scrollTop:$(this.hash).offset().top}, 500);
		// $('.navbar-default a').removeClass('selected');
		// $(this).addClass('selected');
    	});




  let hrs = 0
  let mins=0
  let secs =0
  let hrsTen  = 0;
  let hrsOne  = 0;
  let minsOne = 0;
  let minsTen = 0;
  let secsTen = 0;
  let secsOne = 0;
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
  const inputBoxes = document.getElementById('main').getElementsByTagName('input')
  const labelDiv = document.getElementById('labels')


  //get inital time values from html input
  getTimeValues()

  //store the values in session variables
  saveSessionLength();

  //shorthand values
  parseTimeValues()


  //listen for user inputs to change countdown timer value
  for(let i=0; i<inputBoxes.length; i++){
    inputBoxes[i].addEventListener('change',(ev)=>{
      getTimeValues()
      saveSessionLength()
      parseTimeValues()

    })
  }


$("#button-start").on('click',()=>{

  if(isCounting){
    clearInterval(Interval);
    isCounting = false;
    document.getElementById('play').classList.remove('fa-pause')
    document.getElementById('play').classList.add('fa-play')

  }
  else{
        //if no value entered alert user
    if(!hrs && !mins && !secs){
      alert("Please enter a time...")

    }
    else{
      isCounting = true;
      document.getElementById('play').classList.remove('fa-play')
      document.getElementById('play').classList.add('fa-pause')

      getTimeValues()
      parseTimeValues()
      setDisplay()
      modifyInputField()

      Interval = setInterval(startTimer, 1000)
    }

  }

})

$("#button-reset").on('click',()=>{
  reset = true;
  clearInterval(Interval);
  resetValues()
  setDisplay()

})

$("#button-clear").on('click',()=>{

  reset = true;
  clearInterval(Interval);

  resetValues()
  setDisplay()
  addLabels()
  modifyInputField()
  reset = false;

})

$("#button-done").on('click',()=>{
  clearInterval(Interval);
  parseTimeValues();
  pause = true;

  //get values in seconds
  let diffHrs = (sesHrs - hrs)*60*60;
  let diffMins= (sesMins - mins)*60;
  let diffSecs = sesSecs - secs;
  convertToMins(diffHrs,diffMins,diffSecs)

})


function getTimeValues(){
  hrsTen = document.getElementById("hoursTen").value || '0'
  hrsOne = document.getElementById("hoursOne").value || '0'
  minsTen = document.getElementById("minutesTen").value || '0'
  minsOne = document.getElementById("minutesOne").value || '0'
  secsTen = document.getElementById("secondsTen").value || '0'
  secsOne = document.getElementById("secondsOne").value || '0'

}

function saveSessionLength(){
  sessHrsTen  = hrsTen;
  sessHrsOne  = hrsOne;
  sessMinsTen = minsTen;
  sessMinsOne = minsOne;
  sessSecsTen = secsTen;
  sessSecsOne = secsOne;
}

function parseTimeValues(){
   hrs =  Number(hrsTen+ hrsOne)
   mins = Number(minsTen + minsOne)
   secs = Number(secsTen + secsOne)
}


function modifyInputField(){

  if(reset){
    labelDiv.style.color = 'white';

    for(let i=0; i<inputBoxes.length; i++){
      inputBoxes[i].style['border-bottom']='1.5px solid white';
      inputBoxes[i].disabled = false;
    }
  }
  else{
    labelDiv.style.color = ' #333';

    for(let i=0; i<inputBoxes.length; i++){
      inputBoxes[i].style['border-bottom']='none';
      inputBoxes[i].disabled = true;
    }
  }
}

function addLabels(){
    labelDiv.style.color = 'white';
}

function resetValues(){
  hrsTen = sessHrsTen
  hrsOne =  sessHrsOne
  minsTen = sessMinsTen
  minsOne = sessMinsOne
  secsTen = sessSecsTen
  secsOne = sessSecsOne
}


function convertToMins(hrs,mins,secs){
  let totalSecs = hrs+mins+secs
  console.log(Math.floor(totalSecs/60))
}


function startTimer () {

    parseTimeValues();

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
