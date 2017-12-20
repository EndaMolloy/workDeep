$("ul").on('click','.delete', function(event){
  $(this).parent().fadeOut(500, function(){
    $(this).remove();
  });
  event.stopPropagation();
});


$(".projects ul").on('click','li', function(event){

  if($(".projects li i").hasClass('fa-circle')){
    $(".projects li i").removeClass('fa-circle').addClass('fa-circle-thin')
  }

  $("i",this).removeClass('fa-circle-thin').addClass('fa-circle');
  document.getElementById('taskInput').textContent = $(".projectName",this).text();
});

$(".projects input[type='text']").keypress(function(event){
  if(event.which === 13){

    const projectName = $(this).val();
    $(this).val("");
    $(".projects ul").append("<li><span><i class='fa fa-circle-thin' aria-hidden='true'></i></span><span class='projectName'>"+projectName+ "</span><span class='complete'>$</span><span class='delete'>X</span></li>");
  }
});
