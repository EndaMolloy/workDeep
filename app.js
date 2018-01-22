const express = require('express');
//const morgan = require('morgan')
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const compression = require('compression');
const helmet = require('helmet');
const MongoStore = require('connect-mongo')(session);
const dotenv = require('dotenv').config()

require('./config/passport');

const handlebars = expressHandlebars.create({
  defaultLayout: 'layout',
  extname: '.handlebars',
  helpers: {
    section: function(name, options) {
      if (!this._sections) this._sections = {};
        this._sections[name] = options.fn(this);
        return null;
      }
  }
});

mongoose.promise = global.Promise;
const mongoDB = process.env.MONGODB_URI || 'mongodb://localhost/deepworkauth';
mongoose.connect(mongoDB);

const app = express();
//  app.use(morgan('dev'));

//compress the HTTP response sent back to a client
app.use(compression()); //Compress all routes

//protect against vulnerabilities by setting appropriate HTTP headers
app.use(helmet());

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


//cookie: { maxAge: 600000 },
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
  }),
  cookieName: "workDeep_session",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    httpOnly: true,
    expires: new Date(Date.now() + (100 * 365 * 86400 * 1000))
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next)=>{
  res.locals.success_messages = req.flash('success');
  res.locals.error_messages = req.flash('error');
  res.locals.authenticated = req.user ? true : false;
  res.locals.username = 'You';
  next();
});

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.render('notFound');
});
const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server started listening on port ${port}!`));
