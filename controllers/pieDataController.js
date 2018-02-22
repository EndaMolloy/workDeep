const User  = require('../models/users');
const mongoose = require('mongoose');
const round = require('mongo-round');

module.exports = {
  pieData_get: (user, cb)=> {
    const method = user.method;

    User.aggregate([
      {
        $match: {
          _id: user._id
        }
      },{
        $unwind: "$"+user.method+".projects"
      },{
        $lookup: {
          from: "projects",
          localField: user.method+".projects",
          foreignField: "_id",
          as: "project_docs"
        }
      },{
        $unwind: "$project_docs"
      },{
        $unwind: "$project_docs.time"
      },{
        $group: {
        _id: "$project_docs.projectName",
        total: { $sum: "$project_docs.time.sessionLength" }
        }
      },{
        $project:{
        _id: "$_id",
        total: round("$total")
        }
      }
    ],
    (err,result)=> {
      if(err){
        console.log(err);
      }else{
        //console.log(result);

        let pieChartData = result.map((project)=>{
          return Object.values(project);
        })

        //PIECHART
        pieChartData.unshift(['Project','Hours']);
        //console.log(pieChartData);

        cb(pieChartData)
      }
    });
  }
}
