const Joi = require('joi');

module.exports = {

  validateBody: (schema, type)=> {
    return (req, res, next) => {
      const result = Joi.validate(req.body, schema);

      if(result.error){
        const errorMessage = result.error.details[0].message;
        const message = displayUserError(errorMessage);
        req.flash('error', message);

        if(type == 'password')
          res.redirect('/users/reset')
        else
          res.redirect('/users/signup');
        return;
      }

      if(!req.value){req.value = {};}
      req.value['body'] = result.value;
      next();
    }
  },

  isAuthenticated: (req, res, next)=> {
    //passportjs function
    if(req.isAuthenticated()){
      return next();
    }else{
      req.flash('error', 'Oops, looks like you\'re not allowed to go there');
      res.redirect('/');
    }
  },

  isNotAuthenticated: (req, res, next)=> {
    //passportjs function
    if(req.isAuthenticated()){
      res.redirect('/galaxy/'+req.user._id);
    }else{
      next();
    }
  },

  schemas: {
    userSchema: Joi.object().keys({
      username: Joi.string().min(2).max(20).required(),
      email: Joi.string().email(),
      password: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required(),
      confirmationPassword: Joi.any().valid(Joi.ref('password')).required()
    }),
    passwordSchema: Joi.object().keys({
      password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
      confirmationPassword: Joi.any().valid(Joi.ref('password')).required()
    })
  }

}

function displayUserError(errorMessage) {

  if (errorMessage.includes("confirmationPassword")) {
    return "Your passwords do not match";
  }

  if (errorMessage.includes("length")) {
    return "Your name must be at least 2 characters long";
  }

  if(errorMessage.includes("pattern")) {
    return "Your password must be at least 8 characters long";
  }

};
