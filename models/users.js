const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;



const userSchema = new Schema({
  method :{
    type: String,
    enum: ['local', 'google', 'twitter'],
    required: true
  },
  local: {
    email: String,
    username: String,
    password: String,
    secretToken: String,
    active: Boolean,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }]

  },
  google: {
    googleId: String,
    email: String,
    username: String,
    projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }]
  }
});




const User = mongoose.model('user', userSchema);
module.exports = User;

module.exports.hashPassword = async(password) =>{
  try{
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }catch(err){
    next(err);
  }
};


module.exports.validPassword = async (inputPassword, hashedPassword) => {
  try{
    return await bcrypt.compare(inputPassword, hashedPassword);
  }
  catch(err){
    throw new Error('Comparing failed', err);
  }
};
