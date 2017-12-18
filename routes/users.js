const express = require('express');
const router = express.Router();
const Joi = require('joi');
const passport = require('passport');
const moment = require('moment');


const User  = require('../models/users');
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
  // .post(passport.authenticate('local', {
  //   successRedirect: '/users/galaxy',
  //   failureRedirect: '/users/login',
  //   failureFlash: true
  // }));


router.route('/getData')
  .get(isAuthenticated,(req,res)=>{

    let sortedResult = [];
    let dBtime = {};
    let currWeek={};
    let diffWeek = 0;

    //  seedDB(req.user, () => {

    //Get hours sorted by day
      User.aggregate([
        {
          $match: {
            _id:req.user._id
          }
        },{
          $unwind: "$google.projects"
        },
        { $group: {
          _id: "$google.projects.timestamp",
          total: { $sum: "$google.projects.sessionLength"  }
      }}
      ], (err,result)=> {
        if(err){
          console.log(err);
        }
        //console.log("days: ",result);


        //sort dates oldest to newest
        sortedResult = result.sort((a,b)=> {
          return b._id - a._id;
        });
        //console.log(sortedResult);

        const longestStreak = getLongestStreak(sortedResult);
        const currentStreak = getCurrentStreak(sortedResult);
        console.log("Longest Streak: ",longestStreak);
        console.log("Current Streak: ",currentStreak);

        dBtime = moment(sortedResult[0]._id);
        currWeek = moment().startOf('week');

        console.log("diff in weeks: ",currWeek.diff(dBtime,'weeks'));

        function getLongestStreak(sortedResult){

          let consecArr = [];
          let count = 0;
          for(let i =0; i< sortedResult.length-1; i++){
            if(sortedResult[i]._id - sortedResult[i+1]._id === 86400000){
              count++;
            }else{
              consecArr.push(count);
              count = 0;
            }
          }
          return Math.max(...consecArr);
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
              //else subtract days and count until not equal to 86400000
              let count = 1;
              for(let i=0; i<sortedResult.length-1; i++){
                if(sortedResult[i]._id - sortedResult[i+1]._id === 86400000){
                  count++;
                }else{
                  return count;
                }
              }
            }

        }


        // const chartData = result.map((day)=> {
        //   return {
        //     date: day._id,
        //     count: day.total
        //   }
        // });
        //console.log(JSON.stringify(chartData));

        // const allChartsData = {
        //   heatmap: chartData,
        //   otherChart: {
        //     x: 34,
        //     y: 36
        //   }
        // }

        //res.json(allChartsData);
      });

      // //PIE CHART
      // User.aggregate([
      //   {
      //     $match: {
      //       _id:req.user._id
      //     }
      //   },{
      //     $unwind: "$google.projects"
      //   },
      //   { $group: {
      //     _id: "$google.projects.projectName",
      //     total: { $sum: "$google.projects.sessionLength"  }
      // }}
      // ], (err,result)=> {
      //       if(err){
      //         console.log(err);
      //       }else{
      //         const pieData = result.map((project)=>{
      //           return Object.values(project);
      //         })
      //         pieData.unshift(['Project','Hours']);
      //         //console.log(pieData);
      //         res.json(pieData);
      //       }
      //     });

        //BAR CHART
        User.aggregate([
          {
            $match: {
              _id:req.user._id
            }
          },{
            $unwind: "$google.projects"
          },
          { $group: {
            _id: { $week: "$google.projects.timestamp"},
            total: { $sum: "$google.projects.sessionLength"}
        }}
        ], (err,result)=> {
              if(err){
                console.log(err);
              }else{

                const avgWeekHrs = Math.round(result.reduce((acc,obj)=> {return acc + obj.total},0)/(result.length + diffWeek));


                //This week
                const thisWeek = moment().week();
                const lastWeek = moment().subtract(1,'week').week();
                const newestDbWeek = result[0]._id;
                const nxtNewDbWeek = result[1]._id;

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


                console.log("This weeks (hrs): ",thisWeekHrs);
                console.log("Last weeks (hrs): ",lastWeekHrs);
                console.log("Average Week (hrs): ",avgWeekHrs);

                const last2Weeks = sortedResult.slice(0,14);
                //console.log(last2Weeks);

                let barChartData = [["Sun"],["Mon"],["Tue"],["Wed"],["Thu"],["Fri"],["Sat"]];

                const lastWeekArr = getWeeks(last2Weeks,lastWeek);
                const thisWeekArr = getWeeks(last2Weeks,thisWeek);
                barChartData = updateChartData(barChartData,lastWeekArr,thisWeekArr);



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

                  for(let i=0; i<barChartData.length; i++){
                    for(let j=0; j<thisWeekArr.length; j++){
                      if(barChartData[i][0] === thisWeekArr[j][0]){
                        barChartData[i].push(thisWeekArr[j][1]);
                      }
                    }
                  }

                  for(let i=0; i<barChartData.length; i++){
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
                console.log(barChartData);

                  //res.json(pieData);
              }
            });


    //  }); //Seed end


  });

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

router.route('/logout')
  .get(isAuthenticated,(req,res)=>{
    req.logout();
    req.flash('success', 'Logged out successfully')
    res.redirect('/');
  });

router.route('/auth/google')
  .get(passport.authenticate('google', { scope : ['profile', 'email'] }));

router.route('/auth/google/callback')
  .get(passport.authenticate('google', {
    failureRedirect : '/users/login',
    failureFlash: true
  }), (req,res)=> {
    res.redirect('/users/'+req.user._id)
  });

router.route('/post')
  .post((req,res,next)=> {

    req.user.google.projects.push(req.body);
    req.user.save((err)=> {
      if(err){
        console.log(err);
      }else{
        User.aggregate([
          {
            $match: {
              _id:req.user._id
            }
          },{
            $unwind: "$google.projects"
          },
          { $group: {
            _id: "$google.projects.projectName",
            total: { $sum: "$google.projects.sessionLength"  }
        }}
        ], (err,result)=> {
          if(err){
            console.log(err);
          }
          console.log("Total hours: ",result);
        })
      }
    });



    res.redirect('/users/'+req.user._id)
  })

module.exports = router;
