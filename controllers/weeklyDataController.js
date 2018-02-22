const moment = require('moment');
const User  = require('../models/users');


module.exports = {
  weeklyData_get: (user, diffWeek, cb)=> {

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
          }
          else{

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
}
