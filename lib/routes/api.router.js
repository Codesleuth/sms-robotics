var express = require('express');

var PlayersRouter = require('./api.players.router');

module.exports = function (players) {
  var router = express.Router();

  router.use('/players', PlayersRouter(players));

  return router;
};