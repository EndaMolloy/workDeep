$(document).ready(function () {

  let projectList = [];
  let completedList = [];
  let inFocusIndex = 0;
  const userUrl = window.location.pathname;

  if(projectList.length < 1)
    document.getElementById('taskInput').textContent = "Add a project";


  //GET LIVE PROJECTS FROM THE DATABASE
    $.get('http://localhost:5000'+userUrl+'/liveprojects', function(projects){
      projects.forEach((project,index)=> {

        if(inFocusIndex === index){
          $(".projects ul").append('<li class="list-project"><span id="bullet"><i class="fa fa-circle" aria-hidden="true"></i></span><span class="projectName">'+project.projectName+ '</span><form class="project-list-form" action="/liveprojects/' + project._id + '" method="POST"><span class="complete icon-wrapper-list"><i class="fa fa-check custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span></form><form class="project-list-form" action="/liveprojects/' + project._id + '" method="POST"><span class="delete icon-wrapper-list"><i class="fa fa-times custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span></form></li>');
          document.getElementById('taskInput').textContent = project.projectName;

        }else{
          $(".projects ul").append('<li class="list-project"><span id="bullet"><i class="fa fa-circle-thin" aria-hidden="true"></i></span><span class="projectName">'+project.projectName+ '</span><form class="project-list-form" action="/liveprojects/' + project._id + '" method="POST"><span class="complete icon-wrapper-list"><i class="fa fa-check custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span></form><form class="project-list-form" action="/liveprojects/' + project._id + '" method="POST"><span class="delete icon-wrapper-list"><i class="fa fa-times custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span></form></li>');
        }
        projectList.push(project);
      });

    });



  //DELETE A LIVE PROJECT
  $("ul").on('click','.delete', function(event){

    const confirm = window.confirm("Are you sure you want to delete this project and it's logged time?");

    if (confirm){
      $(this).parent().fadeOut(500, function(){

        const actionUrl = 'http://localhost:5000'+userUrl + $(this).attr('action');
        const $itemToDelete = $(this).parent('.list-project');
        const prevProject = $itemToDelete.prev();
        const nextProject = $itemToDelete.next();
        //console.log($itemToDelete);
        $.ajax({
          url: actionUrl,
          type: 'DELETE',
          itemToDelete: $itemToDelete,
          success: function success(project){
            //console.log(project);</form>
            this.itemToDelete.remove();
            deleteFromProjectList(project,prevProject,nextProject);
          }
        })
      });
    }
    event.stopPropagation();
  });



  //REMOVE A PROJECT FROM LIVE PROJECT LIST AND ADD TO COMPLETED PROJECTS
  $("ul").on('click','.complete', function(event){

    const confirm = window.confirm("Are you sure you want to mark this project as complete?");

    if (confirm){
      $(this).parent().fadeOut(500, function(){

        const actionUrl = 'http://localhost:5000'+userUrl + $(this).attr('action');
        const $itemToUpdate = $(this).parent('.list-project');
        const prevProject = $itemToUpdate.prev();
        const nextProject = $itemToUpdate.next();

        $.ajax({
          url: actionUrl,
          data: {completed: true},
          type: 'PUT',
          itemToUpdate: $itemToUpdate,
          success: function success(project){
            //console.log(project);
            this.itemToUpdate.remove();
            deleteFromProjectList(project,prevProject,nextProject);
          }
        })
      });
    }

    event.stopPropagation();
  });





  //ADD THE SELECTOR TO SELECTED PROJECT
  $(".projects ul").on('click','li', function(event){

    if($("#bullet i").hasClass('fa-circle')){
      $("#bullet i").removeClass('fa-circle').addClass('fa-circle-thin');
    }
    $("#bullet i",this).removeClass('fa-circle-thin').addClass('fa-circle');
    document.getElementById('taskInput').textContent = $(".projectName",this).text();

    inFocusIndex = projectList.findIndex(x => x.projectName === $(".projectName",this).text());
    //console.log(inFocusIndex);
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
          addToLiveProjects(project);
        }
      });
      $(this).val("");
    }
  });

  //delete from the projectList array and select next Project as the inFocusIndex
  function deleteFromProjectList(project, prevProject, nextProject){
    //find the index of the deleted project in projectList
    const deletedIndex = projectList.findIndex(x => x._id === project._id);

    //remove the deleted project from the array
    projectList.splice(deletedIndex,1);

    //give the user the option to add new project if num projects < 5
    if(projectList.length < 5)
      $(".newProject").show();

    //reasign selected project
    //if inFocusIndex > deletedIndex => then the inFocusIndex is reduced by 1
    //else if the projectList is now 0 then give user option to add projectList
    //else if the deleted project is in focus and not the first project in the list, then the previous project becomes the infocus project
    // else the deleted project is the first project in the list so the next project becomes the infocus project
    if(inFocusIndex > deletedIndex)
      inFocusIndex --;
    else {
      if(projectList<1){
        document.getElementById('taskInput').textContent = "Add a project";
      }else{
        if(inFocusIndex == deletedIndex && deletedIndex > 0){
          $("#bullet i",prevProject).removeClass('fa-circle-thin').addClass('fa-circle');
          document.getElementById('taskInput').textContent = $(".projectName",prevProject).text();
          inFocusIndex--;
        }else{
          $("#bullet i",nextProject).removeClass('fa-circle-thin').addClass('fa-circle');
          document.getElementById('taskInput').textContent = $(".projectName",nextProject).text();
        }
      }
    }
  };



  //Adds the newly added projects to the project list
  function addToLiveProjects(project){
    projectList.push(project);
    if(projectList.length === 5){
      $(".newProject").hide();
    }

    if(projectList.length === 1){
      document.getElementById('taskInput').textContent = projectList[0]['projectName'];
      inFocusIndex = 0;
      $(".projects ul").append('<li class="list-project"><span id="bullet"><i class="fa fa-circle" aria-hidden="true"></i></span><span class="projectName">'+project.projectName+ '</span><form class="project-list-form" action="/liveprojects/' + project._id + '" method="POST"><span class="complete icon-wrapper-list"><i class="fa fa-check custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span></form><form class="project-list-form" action="/liveprojects/' + project._id + '" method="POST"><span class="delete icon-wrapper-list"><i class="fa fa-times custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span></form></li>');

    }else{
      $(".projects ul").append('<li class="list-project"><span id="bullet"><i class="fa fa-circle-thin" aria-hidden="true"></i></span><span class="projectName">'+project.projectName+ '</span><form class="project-list-form" action="/liveprojects/' + project._id + '" method="POST"><span class="complete icon-wrapper-list"><i class="fa fa-check custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span></form><form class="project-list-form" action="/liveprojects/' + project._id + '" method="POST"><span class="delete icon-wrapper-list"><i class="fa fa-times custom-icon-list" aria-hidden="true"><span class="fix-editor">&nbsp;</span></i></span></form></li>');
    }

  }



  function addtoCompletedProjects(project){

    completedList.push(project);
    console.log(completedList);
    deleteThisproject(project);
  }

});
