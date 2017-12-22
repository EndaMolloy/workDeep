let projectList = [];
let completedList = [];
let inFocusProject = 0;
let project = "";

$("ul").on('click','.delete', function(event){
  $(this).parent().fadeOut(500, function(){
    let project = $(this).text().trim();
    $(this).remove();
    deleteThisproject(project);

  });
  event.stopPropagation();
});

$("ul").on('click','.complete', function(event){
  $(this).parent().fadeOut(500, function(){
    let project = $(this).text();
    //$(this).remove();
    addtoCompletedProjects(project)

  });
  event.stopPropagation();
});

$(".projects ul").on('click','li', function(event){

  if($("#bullet i").hasClass('fa-circle')){
    $("#bullet i").removeClass('fa-circle').addClass('fa-circle-thin');
  }

  $("#bullet i",this).removeClass('fa-circle-thin').addClass('fa-circle');
  document.getElementById('taskInput').textContent = $(".projectName",this).text();

  inFocusProject = projectList.indexOf($(".projectName",this).text());
  //console.log(inFocusProject);
});

$(".projects input[type='text']").keypress(function(event){

  if((event.which === 13)&&($(this).val().length>0)){
    addtoLiveProjects($(this).val().trim());
    $(this).val("");
    //console.log(projectList.length);
  }

  if(projectList.length === 5){
    $(".newProject").hide();
  }

  if(projectList.length === 1){
    document.getElementById('taskInput').textContent = projectList[0];
    inFocusProject = 0;
  }

});

function deleteThisproject(project){

  let arrIndex = projectList.indexOf(project);

  if(inFocusProject > arrIndex)
    inFocusProject--;

  projectList.splice(arrIndex,1);
  if(projectList.length < 5)
    $(".newProject").show();

  updateListView();
}

function addtoLiveProjects(projectName){
  if(checkDuplicate(projectName)){
    alert("A project with this name already exist. But you already knew that!");
    return;
  }

  projectList.push(projectName);

  updateListView()
}

function updateListView(){
  $(".projects ul").empty();
  projectList.forEach((project, index) => {
    if(!inFocusProject){
      inFocusProject = 0;
    }

    if(inFocusProject === index){
      $(".projects ul").append("<li><span id='bullet'><i class='fa fa-circle' aria-hidden='true'></i></span><span class='projectName'>"+project+ "</span><span class='complete icon-wrapper-list'><i class='fa fa-check custom-icon-list' aria-hidden='true'><span class='fix-editor'>&nbsp;</span></i></span><span class='delete icon-wrapper-list'><i class='fa fa-times custom-icon-list' aria-hidden='true'><span class='fix-editor'>&nbsp;</span></i></span></li>");
      document.getElementById('taskInput').textContent = project;

    }else{
      $(".projects ul").append("<li><span id='bullet'><i class='fa fa-circle-thin' aria-hidden='true'></i></span><span class='projectName'>"+project+ "</span><span class='complete icon-wrapper-list'><i class='fa fa-check custom-icon-list' aria-hidden='true'><span class='fix-editor'>&nbsp;</span></i></span><span class='delete icon-wrapper-list'><i class='fa fa-times custom-icon-list' aria-hidden='true'><span class='fix-editor'>&nbsp;</span></i></span></li>");
    }
    //console.log(inFocusProject);
  });
}

function checkDuplicate(name){
  let matchFound = false;

  projectList.forEach((project)=>{
    if(project === name)
      matchFound = true;
  });

  completedList.forEach((project)=>{
    if(project === name)
      matchFound = true;
  });

  return matchFound;
}

function addtoCompletedProjects(project){

  completedList.push(project);
  console.log(completedList);
  deleteThisproject(project);
}
