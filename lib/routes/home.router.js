var express = require('express'),
    log = require('../logger');

var game_url = process.env.GAME_URL

module.exports = function () {
  var router = express.Router();

  router.get('/', function (req, res, next) {
    if (!game_url) {
      log.error('Unable to redirect to game; GAME_URL env variable is not defined.');
      return next();
    }

    res.writeHead(302, {
      'Content-Type': 'text/plain',
      'Location': game_url
    });
    res.end('Redirecting you to the game world...');
  });

  return router;
};