var express = require('express'),
    http = require('http');

var log = require('./logger'),
    IoServer = require('./ioserver'),
    HomeRouter = require('./routes/home.router'),
    ApiRouter = require('./routes/api.router'),
    SmsRouter = require('./smsrouter'),
    Players = require('./players');

module.exports = function () {
  var app = express();

  app.use(log.middleware());

  var server = http.Server(app);
  var io = IoServer(server);
  var players = Players(io);

  var smsrouter = SmsRouter(players);

  app.use('/api', ApiRouter(players));
  app.use('/', HomeRouter());

  app.use(function (req, res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404: Not Found');
  });

  return server;
};