var express = require('express'),
    http = require('http');

var log = require('./logger'),
    IoServer = require('./ioserver'),
    HomeRouter = require('./routes/home.router'),
    ApiRouter = require('./routes/api.router'),
    SmsRouter = require('./smsrouter'),
    Players = require('./players'),
    Leaderboard = require('./leaderboard');

module.exports = function () {
  var app = express();

  app.use(log.middleware());

  app.use('/console', express.static(__dirname + '/../public/console'));
  app.use('/dashboard', express.static(__dirname + '/../public/dashboard'));
  app.use('/img', express.static(__dirname + '/../public/img'));

  var server = http.Server(app);
  var io = IoServer(server);
  var leaderboard = Leaderboard();
  var players = Players(io, leaderboard);

  var smsrouter = SmsRouter(players);

  app.use('/api', ApiRouter(players, leaderboard));
  app.use('/', HomeRouter());

  app.use(function (req, res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404: Not Found');
  });

  return server;
};