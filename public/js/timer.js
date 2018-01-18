
const time = moment().format('dddd') +", "+moment().format('LL');
document.getElementById('time').textContent = time;

function sendToMongo(time){
  const timeLog = {
    sessionLength: time,
    timestamp: new Date().setHours(0,0,0,0)
  }

  $.post('http://localhost:5000'+userUrl+'/logtime/'+selectedProj, timeLog, function(message){
    if(message.error){
      console.log('Something bad happened');
    }else{
      alert(message);
      timerClear();
      document.getElementById('button-reset').style.display = 'none';
      document.getElementById('button-clear').style.display = 'none';
      document.getElementById('button-finish').style.visibility = 'hidden';
      document.getElementById('toggle').style.visibility = 'visible';
    }
  });
}


let hrs = 0
let mins=0
let secs =0
let hrsTen  = 0;
let hrsOne  = 0;
let minsOne = 0;
let minsTen = 0;
let secsTen = 0;
let secsOne = 0;
let sessHrsTen;
let sessHrsOne;
let sessMinsTen;
let sessMinsOne;
let sessSecsTen;
let sessSecsOne;
let sessHrs;
let sessMins;
let sessSecs;
let count = 0;

let Interval;
let pause = false;
let reset = false;
let selectedProj;
var isCounting = false;
const inputBoxes = document.getElementById('main').getElementsByTagName('input');
const labelDiv = document.getElementById('labels');


//get inital time values from html input
getTimeValues();

//store the values in session variables
saveSessionLength();

//shorthand values
//e.g hrs = 5 mins=13 secs=42
parseTimeValues();


//listen for user inputs to change countdown timer value
for(let i=0; i<inputBoxes.length; i++){
  inputBoxes[i].addEventListener('change',(ev)=>{
    getTimeValues();
    saveSessionLength();
    parseTimeValues();

  })
}



$("#button-start").on('click',()=>{
  if(count === 0){
    selectedProj = getSelectedProjectId($(".projects li"));
    count++;
  }

  if(isCounting){
    clearInterval(Interval);
    isCounting = false;
    document.getElementById('play').classList.remove('fa-pause');
    document.getElementById('play').classList.add('fa-play');
    document.getElementById('button-reset').style.display = 'inline-block';
    document.getElementById('button-clear').style.display = 'inline-block';
    document.getElementById('button-finish').style.visibility = 'visible';
  }
  else{
        //if no value entered alert user
    if(!hrs && !mins && !secs){
      alert("Please enter a time...")

    }
    else{
      isCounting = true;
      document.getElementById('play').classList.remove('fa-play');
      document.getElementById('play').classList.add('fa-pause');
      document.getElementById('button-reset').style.display = 'none';
      document.getElementById('button-clear').style.display = 'none';
      document.getElementById('button-finish').style.visibility = 'hidden';
      document.getElementById('toggle').style.visibility = 'hidden';

      getTimeValues();
      parseTimeValues();
      setDisplay();
      modifyInputField();

      Interval = setInterval(startTimer, 1000);
    }

  }

})

$("#button-reset").on('click',()=>{
  timerReset();
});

$("#button-clear").on('click',()=>{
  timerClear();
});

$("#button-finish").on('click',()=>{
  timerFinish();
});

function timerFinish(){
  const confirm = window.confirm("Finish your current session and log your time?")

  if(confirm){

    parseTimeValues();
    //get values in seconds
    let diffHrs = (sessHrs - hrs)*60*60;
    let diffMins= (sessMins - mins)*60;
    let diffSecs = sessSecs - secs;

    sendToMongo(convertToHrs(diffHrs,diffMins,diffSecs));
    clearInterval(Interval);
  }
}

function timerReset(){
  reset = true;
  count = 0;
  clearInterval(Interval);
  resetValues()
  setDisplay()
  document.getElementById('toggle').style.visibility = 'visible';
  document.getElementById('button-finish').style.visibility = 'hidden';
}

function timerClear(){
  reset = true;
  clearInterval(Interval);

  resetValues()
  setDisplay()
  addLabels()
  modifyInputField()
  reset = false;
  document.getElementById('toggle').style.visibility = 'visible';
  document.getElementById('button-finish').style.visibility = 'hidden';
}



function getSelectedProjectId(li){
  if(!li) return;

  const selector = 'fa-circle-thin';
  for(let i=0; i<li.length; i++){
    if(li[i].innerHTML.indexOf(selector) === -1){
      let projectId = li[i].lastElementChild.action.replace("http://localhost:5000/liveprojects/","");
      return projectId;
    }
  }
}

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

  //all values in seconds
  sessHrs = Number(sessHrsTen+sessHrsOne)*60*60;
  sessMins = Number(sessMinsTen+sessMinsOne)*60;
  sessSecs = Number(sessSecsTen+sessMinsOne);
}

function parseTimeValues(){
  hrs =  hrsTen.toString() + hrsOne.toString();
  mins = minsTen.toString() + minsOne.toString();
  secs = secsTen.toString() + secsOne.toString();

  //console.log("mins:" ,mins);
}

function sessionValuesToHrs(){
  return (sessHrs+sessMins+sessSecs)/3600;
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
    labelDiv.style.color = '#21272d';

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

function convertToHrs(hrs,mins,secs){
  let totalSecs = hrs+mins+secs;
  console.log("hrs: ", totalSecs/3600);
  return totalSecs/3600;
}

function startTimer () {

    parseTimeValues();

    if(secs==00 && mins==00 && hrs==00){
      alert("Times up")
      clearInterval(Interval);

      sendToMongo(sessionValuesToHrs());
    }

    else{
      if(secsOne>'0'){
        secsOne --;
      }
      else{
        if(secsTen>'0'){
          secsOne='9';
          secsTen--;
        }
        else{
          if(minsOne>'0'){
            secsOne='9';
            secsTen='5';
            minsOne--;
          }
          else{
            if(minsTen>'0'){
              secsOne='9';
              secsTen='5';
              minsOne='9';
              minsTen--;
            }
            else{
              if(hrsOne>'0'){
                secsOne='9';
                secsTen='5';
                minsOne='9';
                minsTen='5';
                hrsOne--;
              }
              else{
                if(hrsTen>'0'){
                  secsOne='9';
                  secsTen='5';
                  minsOne='9';
                  minsTen='5';
                  hrsOne='9';
                  hrsTen--;
                }
              }
            }
          }
        }
      }
    }

  setDisplay();

}

function setDisplay(){

    document.getElementById('secondsOne').value = secsOne;
    document.getElementById('secondsTen').value = secsTen;
    document.getElementById("minutesTen").value = minsTen;
    document.getElementById("minutesOne").value = minsOne;
    document.getElementById("hoursTen").value = hrsTen;
    document.getElementById("hoursOne").value = hrsOne;

}
