const moment = require('moment');
const User  = require('../models/users');


module.exports = {
  tableData_get: (user, cb)=> {
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
}
