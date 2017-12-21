let projectList = [];
let completedList = []

$("ul").on('click','.delete', function(event){
  $(this).parent().fadeOut(500, function(){
    let project = $(this).text();
    $(this).remove();
  });
  event.stopPropagation();
});


$(".projects ul").on('click','li', function(event){

  if($("#bullet i").hasClass('fa-circle')){
    $("#bullet i").removeClass('fa-circle').addClass('fa-circle-thin')
  }

  $("#bullet i",this).removeClass('fa-circle-thin').addClass('fa-circle');
//  $("#bullet",this).removeClass('fa-circle-thin').addClass('fa-circle');
  document.getElementById('taskInput').textContent = $(".projectName",this).text();
});

$(".projects input[type='text']").keypress(function(event){
  if((event.which === 13)&&($(this).val().length>0)){

  addtoLiveProjects($(this).val())
    //const projectName = $(this).val();
    $(this).val("");
    //$(".projects ul").append("<li><span><i class='fa fa-circle-thin' aria-hidden='true'></i></span><span class='projectName'>"+projectName+ "</span><span class='complete'>$</span><span class='delete'>X</span></li>");
  }
});


function deleteThisproject(project){
  let arrIndex = projectList.indexOf(project);
  projectList.splice(arrIndex,1);
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
    projectList.forEach((project) => {
      $(".projects ul").append("<li><span id='bullet'><i class='fa fa-circle-thin' aria-hidden='true'></i></span><span class='projectName'>"+project+ "</span><span class='complete'><i class='fa fa-check' aria-hidden='true'></i></span><span class='delete'><i class='fa fa-trash-o' aria-hidden='true'></i></span></li>");
    });
}

function checkDuplicate(name){
  let matchFound = false;

  projectList.forEach((project)=>{
    if(project === name)
      matchFound = true;
  })

  return matchFound;
}
