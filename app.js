var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

var bodyParser = require('body-parser');
var helmet = require('helmet');

const createAllDir = require('./utils/createDir');




var app = express();





app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public'))); //TODO Потом надо добавить для кэша{"maxAge": "86400"}
app.use(helmet());
app.use(helmet.noCache()); //TODO В продакшене надо будет убрать


require('./routes')(app);









createAllDir.createAllDir();




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(res.locals);
});

module.exports = app;
