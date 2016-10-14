var express           =     require('express')
  , passport          =     require('passport')
  , app               =     express();
require('./configuration/settings')(app,passport);
var io = require('socket.io').listen(app.listen(3000));
require('./route/routes')(app, passport,io);
