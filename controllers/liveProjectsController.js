const Project  = require('../models/projects');
const User  = require('../models/users');

module.exports = {
  index: (req,res)=>{
    const method = req.user.method;

    res.render('galaxy',{
      username: req.user[method].username
    });
  },
  liveProjects_get: (req,res)=>{
    User.findById(req.params.id)
      .populate(req.user.method+'.projects')
      .exec((err,user)=>{
        const projectsArr = user[req.user.method].projects;
        const liveProjectsArr = projectsArr.filter((project)=>{
          return project.completed === false;
        });
        res.send(liveProjectsArr);
      });
   },
   liveProjects_post: (req,res)=>{
     const newProject = req.body;
     const projectsArr = req.user[req.user.method].projects;

     Project.create(newProject,(err,project)=>{
       if(err){
         console.log(err);
       }else {
         projectsArr.push(project);
         req.user.save((err)=>{
           if(err)
             console.log(err);
           else {
             res.json(project);
           }
         });
       }
     });
   },
   liveprojects_delete: (req,res)=>{
     const projectsArr = req.user[req.user.method].projects;
     Project.findByIdAndRemove(req.params.project_id,(err, deletedProject)=>{
       if(err){
         console.log(err);
       }else{
         //Remove objectID from User model
         const arrIndex = projectsArr.findIndex(ObjId => ObjId == req.params.project_id);
         projectsArr.splice(arrIndex,1);
         req.user.save((err)=>{
           if(err){
             console.log(err);
           }else{
             res.json(deletedProject)
           }
         });
       }
     });
   },
   liveprojects_update: (req,res)=>{
     const compProject = req.body;
     const projectsArr = req.user[req.user.method].projects;
     Project.findByIdAndUpdate(req.params.project_id, {$set: compProject}, {new: true} ,(err,updatedProj)=>{
       res.json(updatedProj);
     })
   }
}
