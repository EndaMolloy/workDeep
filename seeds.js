const mongoose = require('mongoose');
const moment = require('moment');
const d3 = require('d3-time');
const User = require('./models/users');


function seedDB(profile, cb){
  const now = moment().endOf('day').toDate();
  const yearAgo = moment().startOf('day').subtract(1, 'month').toDate();

  const chartData = d3.timeDays(yearAgo, now).map( (dateElement)=> {
    const projects = ['deepSea','deepSpace','deepEarth'];
    return {
      projectName: projects[Math.floor(Math.random()*projects.length)],
      timestamp: dateElement,
      sessionLength: (dateElement.getDay() !== 0 && dateElement.getDay() !== 6) ? Math.floor(Math.random() * 6) : Math.floor(Math.random() * 10)
    };
  });


    User.findOne({ '_id': profile._id }, (err, user)=> {
      chartData.forEach((chartData)=>{
        user.google.projects.push(chartData)
      })
      user.save((err)=>{
        if(err){
          console.log(err);
        }
        cb();
      });
    });


}

module.exports = seedDB;
