const express = require('express');
const router = express.Router();
const Joi = require('joi');
const passport = require('passport');
const moment = require('moment');
const mongoose = require('mongoose')
const deepPopulate = require('mongoose-deep-populate')(mongoose);


const User  = require('../models/users');
const Project = require('../models/projects');


const seedDB = require("../seeds");

const userSchema = Joi.object().keys({
  username: Joi.string().min(3).max(20).required(),
  email: Joi.string().email(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
  confirmationPassword: Joi.any().valid(Joi.ref('password')).required()
});


const isAuthenticated = (req, res, next)=> {
    //passportjs function
    if(req.isAuthenticated()){
      return next();
    }else{
      req.flash('error', 'Oops looks like you\'re not allowed to go there');
      res.redirect('/');
    }
};

const isNotAuthenticated = (req, res, next)=> {
    //passportjs function
    if(req.isAuthenticated()){
      req.flash('error', 'Oops looks like you\'re not allowed to go there');
      res.redirect('/');
    }else{
      next();
    }
};

//REGISTER A NEW USER
router.route('/register')
  .get(isNotAuthenticated,(req, res) => {
    res.render('register');
  })
  .post((req, res, next)=>{

    const result = Joi.validate(req.body, userSchema);

    if(result.error){
      req.flash('error', 'Data is not valid please try again');
      res.redirect('/users/register');
      return;
    }

    //check if the email already exists
    User.findOne({'email': result.value.email}, (err,user)=>{
      if(user){
        req.flash('error', 'Email is already in use');
        res.redirect('/users/register');
        return;
      }else{
        //hash password before saving to DB
        User.hashPassword(result.value.password, (err, hash)=>{
          if(err){
            throw err;
          }
            delete result.value.confirmationPassword;
            result.value.password = hash;

            let newUser = new User({
              method: 'local',
              local: result.value
            });

            newUser.save((err)=>{
              if(err){
                throw new Error("Something bad happened, please try again")
              }
              req.flash('success', 'You may now login.')
              res.redirect('/login')
            });

        })
      }

    })

  })

router.route('/login')
  .get(isNotAuthenticated,(req, res) => {
    res.render('login');
  })
  .post(passport.authenticate('local',{
    failureRedirect: '/login',
    failureFlash: true
  }), (req,res)=> {
    res.redirect('/users/'+req.user._id)
  });


router.route('/logout')
  .get(isAuthenticated,(req,res)=>{
    req.logout();
    req.flash('success', 'Logged out successfully')
    res.redirect('/');
  });


//GET and ADD LiveProjects
router.route('/:id/liveProjects')
  .get(isAuthenticated,(req,res)=>{
    User.findById(req.params.id)
      .populate('google.projects')
      .exec((err,user)=>{
        const projectsArr = user.google.projects;
        const liveProjectsArr = projectsArr.filter((project)=>{
          return project.completed === false;
        });
        res.send(liveProjectsArr);
      });
   })
  .post((req,res)=>{
    const newProject = req.body;
    const projectsArr = req.user.google.projects;
    console.log(newProject);
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
  })

//DELETE LiveProjects or UPDATE as complete
router.route('/:id/liveprojects/:project_id')
  .delete((req,res)=>{
    const projectsArr = req.user.google.projects;
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
  })
  .put((req,res)=>{
    const compProject = req.body;
    const projectsArr = req.user.google.projects;
    Project.findByIdAndUpdate(req.params.project_id, {$set: compProject}, {new: true} ,(err,updatedProj)=>{
      res.json(updatedProj);
    })
  });

//SAVE Logged time to database
router.route('/:id/logtime/:project_id')
  .post(isAuthenticated,(req,res)=>{
    Project.findById(req.params.project_id,(err, project)=>{
      project.time.push(req.body);
      project.save((err, updatedProj)=>{
        if(err)
          res.json("Something bad went wrong")
        else{
          res.json("Your time has been successfully logged");
        }
      })
    })
  });

//GET CHART DATA
router.route('/:id/logtime')
  .get(isAuthenticated,(req,res)=>{
      //  seedDB(req.user, (msg)=>{
      //    res.json(msg);
      //  });

    getUserChartData(req.user, (chartData)=>{
      res.send(chartData);
    });
  });

//LOAD USER'S HOMEPAGE
router.route('/:id')
  .get(isAuthenticated,(req,res)=>{
    if(req.user.method === 'local'){
      res.render('galaxy',{
        username: req.user.local.username
      });
    }

    if(req.user.method === 'google'){
      res.render('galaxy',{
        username: req.user.google.username
      });
    }

  })
  .post((req,res,next)=>{
    // console.log(req.body);
    // console.log(req.user);
    req.user.google.projects.push(req.body);
    req.user.save();
  });


//GOOGLE AUTH ROUTES
router.route('/auth/google')
  .get(passport.authenticate('google', { scope : ['profile', 'email'] }));


router.route('/auth/google/callback')
  .get(passport.authenticate('google', {
    failureRedirect : '/users/login',
    failureFlash: true
  }), (req,res)=> {
    res.redirect('/users/'+req.user._id)
  });


function getUserChartData(user, cb){

  const chartData = {};

  getDailyData(user, (dailyData, diffWeek)=>{
    if(dailyData === 'error'){
      cb("Looks you haven't logged anytime yet :(")
    }else{
      chartData.dailyData = dailyData;
      getPieData(user, (pieData)=>{
        chartData.pieData = pieData;
        getWeeklyData(user,diffWeek, (weeklyData)=>{
          chartData.weeklyData = weeklyData;
          getTableData(user, (tableData)=>{
            chartData.tableData = tableData;
            cb(chartData);
          })
        });
      });
    }
  });
};


function getDailyData(user, cb){
  const dailyData = {};
  //Get hours sorted by day

  User.aggregate([
    {
      $match: {
        _id: user._id
      }
    },{
      $unwind: "$google.projects"
    },{
      $lookup: {
        from: "projects",
        localField: "google.projects",
        foreignField: "_id",
        as: "project_docs"
      }
    },{
      $unwind: "$project_docs"
    },{
      $unwind: "$project_docs.time"
    },{
      $group: {
      _id: "$project_docs.time.timestamp",
      total: { $sum: "$project_docs.time.sessionLength"  }
        }
      }
    ], (err,result)=> {
    if(err){
      console.log(err);
    }

    if(result.length<1){
      cb('error');
    }else{
      //console.log(result);
      //sort dates oldest to newest
      sortedResult = result.sort((a,b)=> {
        return b._id - a._id;
      });
      console.log(sortedResult);

      const longestStreak = getLongestStreak(sortedResult);
      const currentStreak = getCurrentStreak(sortedResult);
      const totalHours = getTotalHours(sortedResult);
      dailyData.longestStreak = longestStreak;
      dailyData.currentStreak = currentStreak;
      dailyData.totalHours = totalHours;

      //get the difference between the current week and the week of the
      //last user's entry to the database
      const dBtime = moment(sortedResult[0]._id);
      const currWeek = moment().startOf('isoWeek');
      const diffWeek = currWeek.diff(dBtime,'weeks');

      function getLongestStreak(sortedResult){

        let consecArr = [];
        let count = 1;
        for(let i=0; i< sortedResult.length-1; i++){
          if(sortedResult[i]._id - sortedResult[i+1]._id <= 90000000){
            count++;
          }else{
            consecArr.push(count);
            count = 1;
          }
        }
        consecArr.push(count);

        return Math.max(...consecArr) || 0;
      }

      function getCurrentStreak(sortedResult){

        const today = new Date(new Date().setHours(0,0,0,0)).toISOString();
        let yesterday = new Date(new Date().setHours(0,0,0,0));
        yesterday = new Date(yesterday.setDate(yesterday.getDate()-1)).toISOString();

        const lastEntry = sortedResult[0]._id.toISOString();

        //if not today or yesterday then streak = 0
        if(lastEntry !==today && lastEntry !== yesterday){
          return 0;
        }else{
          //else subtract days and count until not equal to 90000000
          let count = 1;
          for(let i=0; i<sortedResult.length-1; i++){
            if(sortedResult[i]._id - sortedResult[i+1]._id <= 90000000){
              count++;
            }else{
              return count;
            }
          }
          return count;
        }
      }

      function getTotalHours(sortedResult){
          return sortedResult.reduce((a,b)=>{
            return a+b.total;
          },0);
      }

      //FINAL HEATMAP DATA
      heatmapData = result.map((day)=> {
        return {
          date: day._id,
          count: day.total
        }
      });
      dailyData.heatmap = heatmapData;

      //console.log(dailyData);
      cb(dailyData,diffWeek);
    }

  });
};


function getPieData(user, cb){

  User.aggregate([
    {
      $match: {
        _id: user._id
      }
    },{
      $unwind: "$google.projects"
    },{
      $lookup: {
        from: "projects",
        localField: "google.projects",
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
      total: { $sum: "$project_docs.time.sessionLength"  }
        }
      }
  ],
  (err,result)=> {
    if(err){
      console.log(err);
    }else{

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


function getWeeklyData(user, diffWeek, cb){

  const weeklyData = {}
  //AGGREGATION FOR WEEKLY DATA - BAR CHART
  User.aggregate([
    {
      $match: {
        _id: user._id
      }
    },{
      $unwind: "$google.projects"
    },{
      $lookup: {
        from: "projects",
        localField: "google.projects",
        foreignField: "_id",
        as: "project_docs"
      }
    },{
      $unwind: "$project_docs"
    },{
      $unwind: "$project_docs.time"
    },
    { $group: {
      _id: {year:{$year: "$project_docs.time.timestamp"},week:{$isoWeek: "$project_docs.time.timestamp"}},
      total: { $sum: "$project_docs.time.sessionLength"}
  }}
  ], (err,result)=> {
        if(err){
          console.log(err);
        }else{

          const avgWeekHrs = Math.round(result.reduce((acc,obj)=> {return acc + obj.total},0)/(result.length + diffWeek));

          //Sort by year then by week
          result.sort((a,b)=> {
            return b._id.year - a._id.year || b._id.week - a._id.week;
          })

          //console.log("selected Array : ",result);

          const thisWeek = moment().isoWeek();;
          const lastWeek = moment().subtract(1,'week').isoWeek();
          const newestDbWeek = result[0]._id.week;
          const nxtNewDbWeek = result[1]._id.week;

          // console.log("This week: ",thisWeek);
          // console.log("Last week: ",lastWeek);

          let thisWeekHrs = thisWeek === newestDbWeek ? result[0].total : 0;
          let lastWeekHrs = getLastWeekHrs(newestDbWeek,nxtNewDbWeek)

          function getLastWeekHrs(newestDbWeek,nxtNewDbWeek){
              let hrs=0;
              if(lastWeek === newestDbWeek){
                hrs = result[0].total;
              }else if (lastWeek === nxtNewDbWeek) {
                hrs = result[1].total;
              }else{
                hrs = 0;
              }
              return hrs;
          }

          weeklyData.thisWeekHrs = thisWeekHrs;
          weeklyData.lastWeekHrs = lastWeekHrs;
          weeklyData.avgWeekHrs = avgWeekHrs;
          // console.log("This weeks (hrs): ",thisWeekHrs);
          // console.log("Last weeks (hrs): ",lastWeekHrs);
          // console.log("Average Week (hrs): ",avgWeekHrs);

          const last2Weeks = sortedResult.slice(0,14);
          //console.log(last2Weeks);

          let barChartData = [['Day', 'This Week', 'Last Week'],["Sun"],["Mon"],["Tue"],["Wed"],["Thu"],["Fri"],["Sat"]];

          const lastWeekArr = getWeeks(last2Weeks,lastWeek);
          const thisWeekArr = getWeeks(last2Weeks,thisWeek);

          //FINAL BAR CHART DATA
          barChartData = updateChartData(barChartData,lastWeekArr,thisWeekArr);
          weeklyData.barChartData = barChartData;


          function getWeeks(weeksArr, week){
            const lastWeekArr = weeksArr.filter((day)=> moment(day._id).week()=== week);
            const iso2Day = lastWeekArr.map((day)=> {
              let dayWord;
              switch(moment(day._id).weekday()){
                case 0:
                  dayWord = "Sun";
                  break;
                case 1:
                  dayWord = "Mon";
                  break;
                case 2:
                  dayWord = "Tue";
                  break;
                case 3:
                  dayWord = "Wed";
                  break;
                case 4:
                  dayWord = "Thu";
                  break;
                case 5:
                  dayWord = "Fri";
                  break;
                case 6:
                  dayWord = "Sat";
              }
               return {
                 "day": dayWord,
                 "hours": day.total
               };
            });
            //Convert object to array of object values
            return iso2Day.map((day)=>Object.values(day));
          }

          function updateChartData(barChartData,lastWeekArr,thisWeekArr){

            for(let i=1; i<barChartData.length; i++){
              for(let j=0; j<thisWeekArr.length; j++){
                if(barChartData[i][0] === thisWeekArr[j][0]){
                  barChartData[i].push(thisWeekArr[j][1]);
                }
              }
            }

            for(let i=0; i<barChartData.length; i++){
               while (barChartData[i].length<2)
                 barChartData[i].push(0);
            }

            for(let i=1; i<barChartData.length; i++){
              for(let j=0; j<lastWeekArr.length; j++){
                if(barChartData[i][0] === lastWeekArr[j][0]){
                  barChartData[i].push(lastWeekArr[j][1]);
                }
              }
            }

            for(let i=0; i<barChartData.length; i++){
              while(barChartData[i].length < 3)
                barChartData[i].push(0);
            }

            return barChartData;
          }
          //console.log(barChartData);

          cb(weeklyData);
        }
      });

}


function getTableData(user, cb){
  User.findById(user._id)
    .populate('google.projects')
    .exec((err,user)=>{
      //console.log(JSON.stringify(user.google.projects));
      getData(user.google.projects, (tableData)=>{
        const tableDataArr=[];
        tableData.forEach(obj=>{
          tableDataArr.push(Object.keys(obj).map(x=>obj[x]));
        })
        tableDataArr.unshift(['Project','Hours',{type: 'date', label: 'Start Date'},{type: 'date', label: 'Finish Date'}]);
        //console.log(tableDataArr);
        cb(tableDataArr)
      });
    });

    function getData(projects, cb){
      const tableData = [];
      projects.forEach(project=>{
        const dates = getDates(project.time);

        tableData.push({
          projectName: project.projectName,
          hours: getHours(project.time),
          startDate: getFormattedDate(project.startDate),
          finishDate: getFinishDate(project.completed, dates)
        })
      });
      //console.log(tableData);
      cb(tableData);
    }

    function getFormattedDate(date){
      const year = moment(date).year();
      const month = moment(date).month();
      const day = moment(date).date();

      return "Date("+year+","+month+","+day+")"
    }

    function getDates(time){
      return time.sort((a,b)=>{
        return Date.parse(a.timestamp) < Date.parse(b.timestamp);
      });
    }

    function getFinishDate(complete, dates){
      if(complete)
        return getFormattedDate(dates[0].timestamp);
      else
        return null;
    }

    function getHours(project){
      return project.reduce((a,b)=>{
        return a + b.sessionLength
      },0);
    }

}

module.exports = router;
