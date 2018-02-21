const randomstring = require('randomstring');
const nodemailer = require('nodemailer');
const mailer = require('../config/nodemailer');
const User  = require('../models/users');

module.exports = {
  localSignup: async(req, res, next)=>{

    try{
      // const result = Joi.validate(req.body, userSchema);
      //
      // if(result.error){
      //   const errorMessage = result.error.details[0].message;
      //   const message = displayUserError(errorMessage);
      //   req.flash('error', message);
      //   res.redirect('/signup');
      //   return;
      // }

      //check if the email already exists, if it does redirect to signup page and notify
      const user = await User.findOne({'local.email': req.value.body.email});
      if(user){
        req.flash('error', 'Email is already in use');
        res.redirect('/signup');
        return;
      }
      //hash password before saving to DB
      const hash = await User.hashPassword(req.value.body.password);
      delete req.value.body.confirmationPassword;
      req.value.body.password = hash;

      //generate secretToken for email verification
      const secretToken = randomstring.generate();
      req.value.body.secretToken = secretToken;

      //flag the account as unverified
      req.value.body.active = false;

      //creat new user
      const newUser = await new User({
        method: 'local',
        local: req.value.body
      });

      await newUser.save();

      //generate and send verification email.
      const html = `Hi ${req.value.body.username}
      <br/><br/>
      Please click the link below to confirm your email address and activate your account.
      <br/><br/>
      <a href="${process.env.URL}/users2/verify/${secretToken}">Click here</a>
      <br/><br/>
      Thank you.`

      await mailer.sendEmail('workDeep.com','workDeep - please verify your email', req.value.body.email, html);

      req.flash('success', `A verification email has been sent to ${req.value.body.email}.`)
      res.redirect('login');

    }
    catch(err){
      next(err)
    }
  },

  localSignin: async (req,res,next)=> {
    // res.redirect('/galaxy/'+req.user._id)
    res.status(200).json({error: 'message'})
  },

  verifyToken: (req,res,next)=> {
    User.findOne({'local.secretToken': req.params.token},(err, user)=>{
      if(!user){
        req.flash('error', 'Looks like that link doesn\'t work.');
        return res.redirect('/');
      }

      user.local.active = true;
      user.save((err)=>{
        if(err) console.log(err);
        else{
          req.flash('success','Verified! You may now sign in.')
          res.redirect('/login');
        }
      });
    });
  },

  forgotPassword: async(req,res,next)=> {
    try{

      const secretToken = randomstring.generate();

      const user = await User.findOne({'local.email': req.body.email});

      if(!user){
        req.flash('error', 'No account with that email address exists.');
        return res.redirect('/forgot');
      }


      user.local.resetPasswordToken = secretToken;
      user.local.resetPasswordExpires = Date.now() + 3600000; //TODO move to .env

      await user.save();

      const html = `Hi ${user.local.username}
          <br/></br>You have requested the reset of the password for your account.<br/>
          Please click on the following link, or paste this into your browser to complete the process:<br/><br/>
          <a href ="http://${process.env.URL}/users2/resetpassword/${secretToken}">http://${process.env.URL}/users2/resetpassword/${secretToken}</a>
          <br/></br>
          If you did not request this, please ignore this email and your password will remain unchanged.`;

      //send the request email
      await mailer.sendEmail('workDeep.com','workDeep password reset', req.body.email, html);

      req.flash('success', `An e-mail has been sent to ${req.body.email} with further instructions.`);
      res.redirect('/forgot');
    }
    catch(err){
      next(err);
    }
  },
  resetpassword: async(req,res,next)=> {
    try {
      const user = await User.findOne({'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': {$gt: Date.now()}});
      if(!user){
        req.flash('error', 'Your link has expired');
        return res.redirect('/forgot');
      }

      // const result = Joi.validate(req.body, passwordSchema);
      //
      // if(result.error){
      //   req.flash('error', 'Data is not valid please try again');
      //   res.redirect(`/users/reset/${req.params.token}`);
      //   return;
      // }

      const hash = await User.hashPassword(req.value.body.password);

      //asign new password and clear password flags
      user.local.password = hash;
      user.local.resetPasswordToken = "";
      user.local.resetPasswordExpires = "";

      await user.save();

      //send email to user to confirm password change
      const html = `Hi ${user.local.username}
      <br/></br>This is confirmation that the password for the account registered to this email address has be changed.
      <br/></br>Have a nice day`;

      await mailer.sendEmail('workDeep.com','workDeep - password reset confirmation', user.local.email, html);

      req.flash('success','Your password has been changed. You may now login with your new password');
      res.redirect('/login');

      } catch (err) {
      next(err);
    }
  },
  validateToken : (req, res, next) => {
    User.findOne({'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': {$gt: Date.now()}},(err, user)=>{
      if(!user){
        req.flash('error', 'Your link has expired');
        return res.redirect('/forgot');
      }
      res.render('reset' ,{layout: 'auth', token: req.params.token});
    });
  }

}
