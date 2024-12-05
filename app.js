var createError = require('http-errors');
var express = require('express');
var path = require('path');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var vendorRouter = require('./routes/vendor');
var rootsRouter = require('./routes/roots');
var sellBoardRouter = require('./routes/sellBoard');
var myPageRouter = require('./routes/myPage');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//카테고리별 번호 매핑
const categories = {
  "농식품": 100,
  "전자기기": 200,
  "생활용품": 300,
  "패션잡화": 400,
  "반려동물": 500,
  "무료나눔": 600
};

//모든 router에서 사용 가능
app.use(function (req, res, next) {
  res.locals.categories = categories;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/roots', rootsRouter); // root 추가
app.use('/vendors', vendorRouter);
app.use('/sellBoard', sellBoardRouter);
app.use('/myPage', myPageRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
