var express = require('express'),
    http = require('http');

var log = require('./logger'),
    IoServer = require('./ioserver'),
    HomeRouter = require('./routes/homerouter'),
    PlayersRouter = require('./routes/playersrouter'),
    SmsRouter = require('./smsrouter'),
    Players = require('./players');

module.exports = function () {
  var app = express();

  app.use(log.middleware());

  var server = http.Server(app);
  var io = IoServer(server);
  var players = Players(io);

  var smsrouter = SmsRouter(players);

  app.use('/players', PlayersRouter(players));
  app.use('/', HomeRouter());

  app.use(function (req, res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404: Not Found');
  });

  return server;
};