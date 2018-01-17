const express = require('express');
const router = express.Router();
const Joi = require('joi');
const passport = require('passport');
const moment = require('moment');
const randomstring = require('randomstring');
const nodemailer = require('nodemailer');
const mailer = require('../config/nodemailer');
const round = require('mongo-round');
const mongoose = require('mongoose');
const deepPopulate = require('mongoose-deep-populate')(mongoose);


const User  = require('../models/users');
const Project = require('../models/projects');


const seedDB = require("../seeds");

const userSchema = Joi.object().keys({
  username: Joi.string().min(2).max(20).required(),
  email: Joi.string().email(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required(),
  confirmationPassword: Joi.any().valid(Joi.ref('password')).required()
});

const passwordSchema = Joi.object().keys({
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
  .post(async(req, res, next)=>{

    try{
      const result = Joi.validate(req.body, userSchema);

      if(result.error){
        const errorMessage = result.error.details[0].message;
        const message = displayUserError(errorMessage);
        req.flash('error', message);
        res.redirect('/signup');
        return;
      }

      //check if the email already exists, if it does redirect to signup page and notify
      const user = await User.findOne({'local.email': result.value.email});
      if(user){
        req.flash('error', 'Email is already in use');
        res.redirect('/signup');
        return;
      }
      //hash password before saving to DB
      const hash = await User.hashPassword(result.value.password);
      delete result.value.confirmationPassword;
      result.value.password = hash;

      //generate secretToken for email verification
      const secretToken = randomstring.generate();
      result.value.secretToken = secretToken;

      //flag the account as unverified
      result.value.active = false;

      //creat new user
      const newUser = await new User({
        method: 'local',
        local: result.value
      });

      await newUser.save();

      //generate and send verification email.
      const html = `Hi ${result.value.username}
      <br/><br/>
      Please click the link below to confirm your email address and activate your account.
      <br/><br/>
      <a href="https://workdeep.herokuapp.com/users/verify/${secretToken}">https://workdeep.herokuapp.com/users/verify/${secretToken}</a>`

      await mailer.sendEmail('workDeep.com','workDeep - please verify your email', result.value.email, html);

      req.flash('success', 'Please check your email for a verification link.')
      res.redirect('login');

    }
    catch(err){
      next(err)
    }

  });


//VERIFY user email address
router.route('/verify/:token')
  .get((req, res)=>{
    User.findOne({'local.secretToken': req.params.token},(err, user)=>{
      if(!user){
        req.flash('error', 'Looks like that link doesn\'t work.');
        return res.redirect('/');
      }

      user.local.active = true;
      user.save((err)=>{
        if(err) console.log(err);
        else{
          req.flash('success','Verified! You may now sign in.')
          res.redirect('/login');
        }
      });
    });
  })

//LOCAL LOGIN
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

//REQUEST password reset
router.route('/forgot')
  .get(isNotAuthenticated,(req,res) => {
    res.render('forgot', {layout: 'auth'});
  })
  .post(async(req,res,next)=> {
    try{

      const secretToken = randomstring.generate();

      const user = await User.findOne({'local.email': req.body.email});
      if(!user){
        req.flash('error', 'No account with that email address exists.');
        return res.redirect('/forgot');
      }

      user.local.resetPasswordToken = secretToken;
      user.local.resetPasswordExpires = Date.now() + 3600000;

      await user.save();

      const html = `Hi ${user.local.username}S
          <br/></br>You have requested the reset of the password for your account.<br/>
          Please click on the following link, or paste this into your browser to complete the process:<br/><br/>
          <a href ="http://${req.headers.host}/users/reset/${secretToken}">http://${req.headers.host}/reset/${secretToken}</a>
          <br/></br>
          If you did not request this, please ignore this email and your password will remain unchanged.`;

      //send the request email
      await mailer.sendEmail('workDeep.com','workDeep password reset', req.body.email, html);

      req.flash('success', `An e-mail has been sent to ${req.body.email} with further instructions.`);
      res.redirect('/forgot');
    }
    catch(err){
      next(err);
    }
  });

//VERIFY and handle user password change
router.route('/reset/:token')
  .get((req,res) => {
    User.findOne({'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': {$gt: Date.now()}},(err, user)=>{
      if(!user){
        req.flash('error', 'Your link has expired');
        return res.redirect('/forgot');
      }
      res.render('reset' ,{layout: 'auth', token: req.params.token});
    });
  })
  .post(async(req,res,next)=> {
    try {
      const user = await User.findOne({'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': {$gt: Date.now()}});
      if(!user){
        req.flash('error', 'Your link has expired');
        return res.redirect('/forgot');
      }

      const result = Joi.validate(req.body, passwordSchema);

      if(result.error){
        req.flash('error', 'Data is not valid please try again');
        res.redirect(`/users/reset/${req.params.token}`);
        return;
      }

      const hash = await User.hashPassword(result.value.password);

      //asign new password and clear password flags
      user.local.password = hash;
      user.local.resetPasswordToken = "";
      user.local.resetPasswordExpires = "";

      await user.save();

      //send email to user to confirm password change
      const html = `Hi ${user.local.username}
      <br/></br>This is confirmation that the password for the account registered to this email address has be changed.
      <br/></br>Have a nice day`;

      await mailer.sendEmail('workDeep.com','workDeep - password reset confirmation', user.local.email, html);

      req.flash('success','Your password has been changed. You may now login with your new password');
      res.redirect('/login');

      } catch (err) {
      next(err);
    }
  });

//LOGOUT of app
router.route('/logout')
  .get(isAuthenticated,(req,res)=>{
    req.logout();
    req.flash('success', 'Logged out successfully')
    res.redirect('/');
  });


//SOCIAL MEDIA ROUTES

//GOOGLE AUTH ROUTES
router.route('/auth/google')
  .get(passport.authenticate('google', { scope : ['profile', 'email'] }));
router.route('/auth/google/callback')
  .get(passport.authenticate('google', {
    failureRedirect : '/users/login',
    failureFlash: true
  }), (req,res)=> {
    res.redirect('/users/'+req.user._id);
  });

//TWITTER AUTH ROUTES
router.route('/auth/twitter')
  .get(passport.authenticate('twitter'));
router.route('/auth/twitter/callback')
  .get(passport.authenticate('twitter', {
    failureRedirect : '/users/login',
    failureFlash: true
  }), (req,res)=> {
    res.redirect('/users/'+req.user._id);
  });

//GITHUB AUTH ROUTES
router.route('/auth/github')
  .get(passport.authenticate('github', { scope : ['user:email'] }));
router.route('/auth/github/callback')
  .get(passport.authenticate('github', {
    failureRedirect : '/users/login',
    failureFlash: true
  }), (req,res)=> {
    res.redirect('/users/'+req.user._id);
  });

//LOAD USER'S HOMEPAGE
router.route('/:id')
  .get(isAuthenticated,(req,res)=>{
    const method = req.user.method;

    res.render('galaxy',{
      username: req.user[method].username
    });
  });

//GET and ADD LiveProjects
router.route('/:id/liveProjects')
  .get(isAuthenticated,(req,res)=>{
    User.findById(req.params.id)
      .populate(req.user.method+'.projects')
      .exec((err,user)=>{
        const projectsArr = user[req.user.method].projects;
        const liveProjectsArr = projectsArr.filter((project)=>{
          return project.completed === false;
        });
        res.send(liveProjectsArr);
      });
   })
  .post((req,res)=>{
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
  })

  //DELETE LiveProjects or UPDATE as complete
  router.route('/:id/liveprojects/:project_id')
    .delete((req,res)=>{
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
    })
    .put((req,res)=>{
      const compProject = req.body;
      const projectsArr = req.user[req.user.method].projects;
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



//DASHBOARD FUNCTIONS FOR GETTING CHART DATA
//TODO Convert to promises
function getUserChartData(user, cb){

  const chartData = {};

  getDailyData(user, (dailyData, diffWeek)=>{
    if(dailyData === 'error'){
      cb("Looks you haven't logged anytime yet ¯\\(°_o)/¯")
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
      _id: "$project_docs.time.timestamp",
      total: { $sum: "$project_docs.time.sessionLength"  }
        }
    },{
      $project: {
        _id: "$_id",
        total: round("$total", 1)
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
      //console.log(sortedResult);

      const longestStreak = getLongestStreak(sortedResult);
      const currentStreak = getCurrentStreak(sortedResult);
      const totalHours = Math.round(getTotalHours(sortedResult));
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


function getWeeklyData(user, diffWeek, cb){

  const weeklyData = {};
  //AGGREGATION FOR WEEKLY DATA - BAR CHART
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
    },
    { $group: {
      _id: {year:{$year: "$project_docs.time.timestamp"},week:{$isoWeek: "$project_docs.time.timestamp"}},
      total: { $sum: "$project_docs.time.sessionLength"}
      }
    }
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

          const thisWeek = moment().isoWeek();
          const lastWeek = moment().subtract(1,'week').isoWeek();
          const newestDbWeek = result[0]._id.week;
          const nxtNewDbWeek = result.length > 1 ? result[1]._id.week : null;

          // console.log("This week: ",thisWeek);
          // console.log("Last week: ",lastWeek);

          //if the first value in the array is timestamped as this week then its this weeks hours,
          //else zero hours for this week.
          const thisWeekHrs = thisWeek === newestDbWeek ? result[0].total : 0;
          const lastWeekHrs = getLastWeekHrs(newestDbWeek,nxtNewDbWeek);

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

          weeklyData.thisWeekHrs = Math.round(thisWeekHrs);
          weeklyData.lastWeekHrs = Math.round(lastWeekHrs);
          weeklyData.avgWeekHrs = Math.round(avgWeekHrs);
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
                 "hours": Number((day.total).toFixed(1))
               };
            });
            //Convert object to array of object values
            return iso2Day.map((day)=>Object.values(day));
          }


          //put the data in the correct order for the barchart
          function updateChartData(barChartData,lastWeekArr,thisWeekArr){

            for(let i=1; i<barChartData.length; i++){
              for(let j=0; j<thisWeekArr.length; j++){
                if(barChartData[i][0] === thisWeekArr[j][0]){
                  barChartData[i].push(thisWeekArr[j][1]);
                }
              }
            }

            //zero padding if no values
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
  const method = user.method;

  User.findById(user._id)
    .populate(method+'.projects')
    .exec((err,user)=>{
      //console.log(JSON.stringify(user.google.projects));
      getData(user[method].projects, (tableData)=>{
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
          hours: Math.round(getHours(project.time)),
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

function displayUserError(errorMessage){

  if (errorMessage.includes("confirmationPassword")) {
    return "Your passwords do not match";
  }

  if (errorMessage.includes("length")) {
    return "Your name must be at least 2 characters long";
  }

  if(errorMessage.includes("pattern")) {
    return "Your password must be at least 8 characters long";
  }

}

module.exports = router;
