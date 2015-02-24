var express = require('express'),
    ioserver = require('./ioserver'),
    http = require('http'),
    log = require('./logger'),
    playersrouter = require('./routes/playersrouter'),
    Players = require('./players'),
    SmsRouter = require('./smsrouter');

module.exports = function () {
  var app = express();
  app.use(log.middleware());

  app.use('/console', express.static(__dirname + '/../public/console'));

  var server = http.Server(app);
  var io = ioserver(server);
  var players = Players(io);

  var smsrouter = SmsRouter(players);

  app.use('/players', playersrouter(players));

  app.use(function (req, res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end();
  });

  return server;
};