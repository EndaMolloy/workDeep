const seedDB = require("../seeds");
const {dailyData_get} = require('./dailyDataController');
const {pieData_get} = require('./pieDataController');
const {tableData_get} = require('./tableDataController');
const {weeklyData_get} = require('./weeklyDataController');
const Project = require('../models/projects');

module.exports = {
  dashboardData_get: (req,res)=>{
      //  seedDB(req.user, (msg)=>{
      //    res.json(msg);
      //  });
    getUserChartData(req.user, (chartData)=>{
      if(typeof chartData === 'string' && chartData.length>50){
        res.send("Someting went wrong while trying to retrive your data");
      }else{
        res.send(chartData);
      }
    });
  },
  dashboardData_post: (req,res)=>{
    Project.findById(req.params.project_id,(err, project)=>{
      project.time.push(req.body);
      project.save((err, updatedProj)=>{
        if(err)
          res.json("Something bad went wrong");
        else{
          res.json("Your time has been successfully logged");
        }
      })
    })
  }
}


//DASHBOARD FUNCTIONS FOR GETTING CHART DATA
//TODO Convert to promises
function getUserChartData(user, cb){

  const chartData = {};

  dailyData_get(user, (dailyData, diffWeek)=>{
    if(dailyData === 'error'){
      cb("You need to log at least 30mins... ¯\\(°_o)/¯")
    }else{
      chartData.dailyData = dailyData;
      pieData_get(user, (pieData)=>{
        chartData.pieData = pieData;
        weeklyData_get(user,diffWeek, (weeklyData)=>{
          chartData.weeklyData = weeklyData;
          tableData_get(user, (tableData)=>{
            chartData.tableData = tableData;
            cb(chartData);
          })
        });
      });
    }
  });
};
