const express = require('express');
const morgan = require('morgan')
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
const settings = require('./settings');
require('./config/passport');


mongoose.Promise = require('bluebird');
const mongoDB = process.env.MONGODB_URI || 'mongodb://localhost/deepworkauth';
mongoose.connect(mongoDB);

const app = express();
//  app.use(morgan('dev'));

//compress the HTTP response sent back to a client
app.use(compression()); //Compress all routes

//protect against vulnerabilities by setting appropriate HTTP headers
app.use(helmet());

//middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
  }),
  cookieName: "workDeep_session",
  secret: settings.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
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
  next();
});

// View Engine
app.set('views', path.join(__dirname, 'views'));
const hbsHelpers = expressHandlebars.create({
  defaultLayout: 'layout',
  extname: '.handlebars',
  helpers: require('./helpers/hbsHelpers.js')
});
app.engine('handlebars', hbsHelpers.engine);
app.set('view engine', 'handlebars');


//routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/galaxy', require('./routes/galaxy'));


// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.render('notFound');
});

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server started listening on port ${port}!`));
