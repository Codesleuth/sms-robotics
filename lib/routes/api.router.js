var express = require('express');

var PlayersRouter = require('./api.players.router');

module.exports = function (players, leaderboard) {
  var router = express.Router();

  router.use('/players', PlayersRouter(players, leaderboard));

  return router;
};