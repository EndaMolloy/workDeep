const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const liveProjectSchema = new Schema({
  projectName: String
});

const LiveProject = mongoose.model('liveProject', liveProjectSchema);
module.exports = LiveProject;
