var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

var bodyParser = require('body-parser');
var helmet = require('helmet');

var os = require('os');
var fs = require('fs');









var app = express();





app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());



require('./routes')(app);




//TODO необходимо потом реализовать очистку этой папки, по окончании ковертации.
const pathToTempVideoDir = os.tmpdir() + '/tmpVideoAdsMe';




fs.stat(pathToTempVideoDir, function (err, stats) {

    if (stats == undefined) {

        fs.mkdirSync(pathToTempVideoDir);

    } else {


        console.log(stats);

    }




});


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
