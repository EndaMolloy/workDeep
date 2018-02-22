const User  = require('../models/users');
const moment = require('moment');
const round = require('mongo-round');

module.exports = {
  dailyData_get: (user, cb)=> {
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

        const totalHours = Math.round(getTotalHours(sortedResult));
        const longestStreak = getLongestStreak(sortedResult);
        const currentStreak = getCurrentStreak(sortedResult);

        dailyData.totalHours = totalHours;
        dailyData.longestStreak = longestStreak;
        dailyData.currentStreak = currentStreak;


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

        if(dailyData.totalHours<0.5){
          cb('error')
        }else{
          cb(dailyData,diffWeek);
        }


      }

    });
  }
}
