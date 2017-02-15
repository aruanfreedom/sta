var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

var bodyParser = require('body-parser');
var helmet = require('helmet');

var os = require('os');
var fs = require('fs');

var VideoService = require('./services/VideoService');

var app = express();





app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public'))); //TODO Потом надо добавить для кэша{"maxAge": "86400"}
app.use(helmet());
app.use(helmet.noCache());


require('./routes')(app);





//TODO Потом надо все папки убрать в отдельный модуль
const pathToMPD = './public/mpddirectory';




fs.stat(pathToMPD, function (err, stats) {

    if (stats == undefined) {

        fs.mkdirSync(pathToMPD);

    } else {


        console.log(err);

    }




});

//TODO необходимо потом реализовать очистку этой папки, по окончании ковертации.
const pathToTempVideoDir = os.tmpdir() + '/tmpVideoAdsMe';




fs.stat(pathToTempVideoDir, function (err, stats) {

    if (stats == undefined) {

        fs.mkdirSync(pathToTempVideoDir);

    } else {


        console.log(err);

    }




});






/**
 * Для отражения CSRF атак.
 */
let tokenCSRF = '343434343434343434';
app.use(function (req, res, next) {

    let tokenFromClient = req.body.tokenCSRF || req.get('tokenCSRF') || req.query.tokenCSRF;

    if (tokenCSRF == tokenFromClient) {


        next();

    }else {


        res.json({"code": "noCsrfToken"});

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
