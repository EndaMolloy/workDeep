const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const projectSchema = new Schema({
  projectName: String,
  startDate: {
    type: Date,
    default: new Date(new Date().setHours(0,0,0,0)).toISOString()
  },
  finishDate: {
    type: Date
  },
  time: [{
    sessionLength: Number,
    timestamp: Date
  }],
  completed: {
    type:Boolean,
    default: false
  }
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
