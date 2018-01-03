const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const projectSchema = new Schema({
  projectName: String,
  sessionLength: Number,
  timestamp: Date,
  completed: {
    type:Boolean,
    default: false
  }
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
