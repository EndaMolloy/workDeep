// $("ul").on('click','span', function(event){
//   $(this).parent().fadeOut(500, function(){
//     $(this).remove();
//   });
//   event.stopPropagation();
// });


$(".projects ul").on('click', function(event){
  $("i", this).toggleClass("fa-circle fa-circle-thin");
});

$(".projects input[type='text']").keypress(function(event){
  if(event.which === 13){

    const projectName = $(this).val();
    $(this).val("");
    $(".projects ul").append("<li><span><i class='fa fa-circle-thin' aria-hidden='true'></i></span>"+projectName+" <span>X</span></li>");
  }
});
