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
const dotenv = require('dotenv').config()

require('./config/passport');



mongoose.promise = global.Promise;
mongoose.connect('mongodb://localhost/deepworkauth');

const app = express();
app.use(morgan('dev'));

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', expressHandlebars({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  cookie: { maxAge: 600000 },
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false
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
