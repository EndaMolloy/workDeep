let projectList = [];
let completedList = [];
let inFocusProject = 0;
let project = "";

$("ul").on('click','.delete', function(event){
  $(this).parent().fadeOut(500, function(){
    let project = $(this).text().trim();

    const actionUrl = 'http://localhost:5000/users' + $(this).attr('action');
    const $itemToDelete = $(this).parent('.list-project');
    console.log($itemToDelete);
    $.ajax({
      url: actionUrl,
      type: 'DELETE',
      itemToDelete: $itemToDelete,
      success: function success(project){
        console.log(project);
        //this.itemToDelete.remove();
      }
    })
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

  //inFocusProject = projectList.indexOf($(".projectName",this).text());
  //console.log(inFocusProject);
});

$(".projects input[type='text']").keypress(function(event){

  let userInput = $(this).val().trim();

  if((event.which === 13)&&(userInput.length>0)){

    $.post('http://localhost:5000/users/liveprojects',{projectName:userInput}, function(projectObj){
      if(!project.error){

        addtoLiveProjects(projectObj);
      }else{
        console.log('Something is wrong');
      }
    });

    //addtoLiveProjects(userInput);
    $(this).val("");
    console.log("List length:", projectList.length);
  }



  if(projectList.length === 1){
    document.getElementById('taskInput').textContent = projectList[0]['projectName'];
    inFocusProject = 0;
  }

});

function deleteThisproject(project){

  let arrIndex = projectList.indexOf(project);

  if(inFocusProject >= arrIndex)
    inFocusProject--;

  projectList.splice(arrIndex,1);
  if(projectList.length < 5)
    $(".newProject").show();

  updateListView();
}

function addtoLiveProjects(projectObj){
  // if(checkDuplicate(projectName)){
  //   alert("A project with this name already exist. But you already knew that!");
  //   return;
  // }

  projectList.push(projectObj);
  if(projectList.length === 5){
    $(".newProject").hide();
  }

  updateListView()
}

function updateListView(){
  $(".projects ul").empty();
  projectList.forEach((project, index) => {

    if(inFocusProject === index){
      $(".projects ul").append('<li class="list-project"><span id="bullet"><i class="fa fa-circle" aria-hidden="true"></i></span><span class="projectName">'+project.projectName+ '</span><span class="complete icon-wrapper-list"><i class="fa fa-check custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span><form class="project-list-form" action="/liveprojects/' + project._id + '" method="POST"><span class="delete icon-wrapper-list"><i class="fa fa-times custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span></form></li>');
      document.getElementById('taskInput').textContent = project.projectName;

    }else{
      $(".projects ul").append('<li class="list-project"><span id="bullet"><i class="fa fa-circle-thin" aria-hidden="true"></i></span><span class="projectName">'+project.projectName+ '</span><span class="complete icon-wrapper-list"><i class="fa fa-check custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span><form class="project-list-form" action="/liveprojects/' + project._id + '" method="POST"><span class="delete icon-wrapper-list"><i class="fa fa-times custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span></form></li>');
    }
  });
  //console.log(inFocusProject);
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
