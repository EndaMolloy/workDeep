$(document).ready(function () {

  let projectList = [];
  let completedList = [];
  let inFocusProject = 0;
  const userUrl = window.location.pathname;

  //GET LIVE PROJECTS FROM THE DATABASE
    $.get('http://localhost:5000'+userUrl+'/liveprojects', function(projects){
      projects.forEach((project,index)=> {

        if(inFocusProject === index){
          $(".projects ul").append('<li class="list-project"><span id="bullet"><i class="fa fa-circle" aria-hidden="true"></i></span><span class="projectName">'+project.projectName+ '</span><span class="complete icon-wrapper-list"><i class="fa fa-check custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span><form class="project-list-form" action="/liveprojects/' + project._id + '" method="POST"><span class="delete icon-wrapper-list"><i class="fa fa-times custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span></form></li>');
          document.getElementById('taskInput').textContent = project.projectName;

        }else{
          $(".projects ul").append('<li class="list-project"><span id="bullet"><i class="fa fa-circle-thin" aria-hidden="true"></i></span><span class="projectName">'+project.projectName+ '</span><span class="complete icon-wrapper-list"><i class="fa fa-check custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span><form class="project-list-form" action="/liveprojects/' + project._id + '" method="POST"><span class="delete icon-wrapper-list"><i class="fa fa-times custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span></form></li>');
        }
        projectList.push(project);
      });

    });

  //DELETE A LIVE PROJECT
  $("ul").on('click','.delete', function(event){
    $(this).parent().fadeOut(500, function(){

      const actionUrl = 'http://localhost:5000'+userUrl + $(this).attr('action');
      const $itemToDelete = $(this).parent('.list-project');
      const prevProject = $itemToDelete.prev();
      //console.log($itemToDelete);
      $.ajax({
        url: actionUrl,
        type: 'DELETE',
        itemToDelete: $itemToDelete,
        success: function success(project){
          //console.log(project);
          this.itemToDelete.remove();
          deleteFromProjectList(project,prevProject);
        }
      })
    });
    event.stopPropagation();
  });

  //REMOVE A PROJECT FROM LIVE PROJECT LIST AND ADD TO COMPLETED PROJECTS
  $("ul").on('click','.complete', function(event){
    $(this).parent().fadeOut(500, function(){
      let project = $(this).text();
      //$(this).remove();
      addtoCompletedProjects(project)
      getAllProjects();

    });
    event.stopPropagation();
  });

  //ADD THE SELECTOR TO SELECTED PROJECT
  $(".projects ul").on('click','li', function(event){

    if($("#bullet i").hasClass('fa-circle')){
      $("#bullet i").removeClass('fa-circle').addClass('fa-circle-thin');
    }
    $("#bullet i",this).removeClass('fa-circle-thin').addClass('fa-circle');
    document.getElementById('taskInput').textContent = $(".projectName",this).text();

    inFocusProject = projectList.findIndex(x => x.projectName === $(".projectName",this).text());
    //console.log(inFocusProject);
  });

  //ADD NEW LIVE PROJECT
  $(".projects input[type='text']").keypress(function(event){

  //TODO Check if project with duplicate name exists in user database

    let userInput = $(this).val().trim();
    if((event.which === 13)&&(userInput.length>0)){
      $.post('http://localhost:5000'+userUrl+'/liveprojects',{projectName:userInput}, function(project){
        if(project.error){
          console.log('Something bad happened');
        }else{
          $(".projects ul").append('<li class="list-project"><span id="bullet"><i class="fa fa-circle-thin" aria-hidden="true"></i></span><span class="projectName">'+project.projectName+ '</span><span class="complete icon-wrapper-list"><i class="fa fa-check custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span><form class="project-list-form" action="/liveprojects/' + project._id + '" method="POST"><span class="delete icon-wrapper-list"><i class="fa fa-times custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span></form></li>');
        }
        addToLiveProjects(project);
      });
      $(this).val("");
    }

    if(projectList.length === 1){
      document.getElementById('taskInput').textContent = projectList[0]['projectName'];
      inFocusProject = 0;
    }

  });


  function deleteFromProjectList(project, prevProject){
    let arrIndex = projectList.findIndex(x => x._id === project._id);

    if(inFocusProject == arrIndex){
      $("#bullet i",prevProject).removeClass('fa-circle-thin').addClass('fa-circle');
      document.getElementById('taskInput').textContent = $(".projectName",prevProject).text();
      inFocusProject--;
    }

    if(inFocusProject > arrIndex)
      inFocusProject --;

    projectList.splice(arrIndex,1);
    if(projectList.length < 5)
      $(".newProject").show();
  }

  function addToLiveProjects(project){
    projectList.push(project);
    if(projectList.length === 5){
      $(".newProject").hide();
    }
  }

  function addtoCompletedProjects(project){

    completedList.push(project);
    console.log(completedList);
    deleteThisproject(project);
  }

});
