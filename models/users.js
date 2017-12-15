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
    projects: [
      {
        projectName: String,
        sessionLength: Number,
        timestamp: Date
      }
    ]
  },
  google: {
    googleId: String,
    email: String,
    username: String,
    projects: [
      {
        projectName: String,
        sessionLength: Number,
        timestamp: Date
      }
    ]
  }
});




const User = mongoose.model('user', userSchema);
module.exports = User;

module.exports.hashPassword = (password, cb) =>{
  bcrypt.genSalt(10, (err, salt) =>{
    if(err){
      throw new Error('Hashing failed',err);
    }else{
      bcrypt.hash(password, salt,(err,hash) =>{
        if(err){
          throw new Error('Hashing failed',err);
        }else{

          return cb(null,hash);

        }
      });
    }
  });
}

module.exports.validPassword = (inputPassword, hashedPassword, cb) => {
  bcrypt.compare(inputPassword, hashedPassword, (err,res)=>{
    if(err){
      throw new Error('Comparing failed', err);
    }else{
      return cb(null, res);
    }
  })
}
