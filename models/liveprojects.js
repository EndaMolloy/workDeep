const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const liveProjectSchema = new Schema({
  projectName: String
});

const liveProject = mongoose.model('liveProject', liveProjectSchema);
module.exports = liveProject;
