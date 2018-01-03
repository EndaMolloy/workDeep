const mongoose = require('mongoose');
const moment = require('moment');
const d3 = require('d3-time');
const User = require('./models/users');
const Project = require('./models/projects')


function seedDB(profile, callback){
  const now = moment().endOf('day').toDate();
  const yearAgo = moment().startOf('day').subtract(1, 'year').toDate();

  createSeedData(yearAgo, now, (chartData)=>{

    User.findOne({ '_id': profile._id }, (err, user)=> {
      let count = 0;
      chartData.forEach((project)=>{
        Project.create(project, (err,project)=>{
            count++;
            //console.log(count+": ",project);
            user.google.projects.push(project);

            if(count === chartData.length){
              user.save((err)=>{
              //  console.log(count+": ",user.google.projects);
                callback('complete')
              })
            }
          });
        });
      });
    });
  }

  function createSeedData(yearAgo, now, cb){
    const chartData = d3.timeDays(yearAgo, now).map((dateElement)=> {
      const projects = ['deepSea','deepSpace','deepEarth'];
      return {
        projectName: projects[Math.floor(Math.random()*projects.length)],
        timestamp: dateElement,
        sessionLength: (dateElement.getDay() !== 0 && dateElement.getDay() !== 6) ? Math.floor(Math.random() * 6) : Math.floor(Math.random() * 10)
      };
    });
    cb(chartData);
  }


module.exports = seedDB;
