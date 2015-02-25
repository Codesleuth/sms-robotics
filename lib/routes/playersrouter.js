var express = require('express'),
    bodyParser = require('body-parser'),
    playerid = require('../playerid');

var textPlainHeader = { 'Content-Type': 'text/plain' };
var applicationJsonHeader = { 'Content-Type': 'application/json' };

var playerIdRegex = /^(?!447).*$/;

function SendPlayerCommand(id, res, players, command) {
  var player = players.findById(id);
  if (player) {
    player[command]();
    res.writeHead(200, textPlainHeader);
    return res.end('200: OK');
  }

  res.writeHead(404, textPlainHeader);
  res.end('404: Player not found');
}

function EncodePlayer(player, score) {
  var id = player.getId();
  var result = {
    id: id,
    name: player.getName(),
    joined: player.getJoined(),
    kills: player.getKills(),
    deaths: player.getDeaths(),
    total_kills: score.kills,
    total_deaths: score.deaths,
    dead: player.isDead()
  };

  var expectedTimeout = player.getExpectedTimeout();
  if (expectedTimeout !== null)
    result.timeout = expectedTimeout.format();

  result.links = [{
    rel: "self",
    href: "/players/" + id
  },{
    rel: "left",
    href: "/players/" + id + "/left"
  },{
    rel: "right",
    href: "/players/" + id + "/right"
  },{
    rel: "up",
    href: "/players/" + id + "/up"
  },{
    rel: "down",
    href: "/players/" + id + "/down"
  }];

  return result;
}

module.exports = function (players, leaderboard) {
  var router = express.Router();

  router.get('/', function (req, res) {
    var responseArray = players.list().map(function (player) {
      var score = leaderboard.getPlayerScore(player.getId());
      return EncodePlayer(player, score);
    });
    res.writeHead(200, applicationJsonHeader);
    res.end(JSON.stringify(responseArray));
  });

  router.post('/', bodyParser.json(), function (req, res) {
    if (!req.body.name || !req.body.id || !playerIdRegex.test(req.body.id)) {
      res.writeHead(400, textPlainHeader);
      return res.end('400: Must provide a name and id which does not start with 447');
    }

    var playerId = req.body.id;
    var player = players.new(playerId);
    player.setName(req.body.name);

    var score = leaderboard.getPlayerScore(player.getId());

    res.writeHead(200, applicationJsonHeader);
    res.end(JSON.stringify(EncodePlayer(player, score)));
  });

  router.get('/:id', function (req, res) {
    var player = players.findById(req.params.id);
    if (player) {
      var score = leaderboard.getPlayerScore(player.getId());

      res.writeHead(200, applicationJsonHeader);
      return res.end(JSON.stringify(EncodePlayer(player, score)));
    }

    res.writeHead(404, textPlainHeader);
    res.end('404: Player not found');
  });

  router.delete('/:id', function (req, res) {
    var deleted = players.delete(req.params.id);
    if (deleted) {
      res.writeHead(200, textPlainHeader);
      return res.end('200: OK');
    }

    res.writeHead(404, textPlainHeader);
    res.end('404: Player not found');
  });

  router.get('/:id/left', function (req, res) {
    SendPlayerCommand(req.params.id, res, players, 'moveLeft');
  });

  router.get('/:id/right', function (req, res) {
    SendPlayerCommand(req.params.id, res, players, 'moveRight');
  });

  router.get('/:id/up', function (req, res) {
    SendPlayerCommand(req.params.id, res, players, 'moveUp');
  });

  router.get('/:id/down', function (req, res) {
    SendPlayerCommand(req.params.id, res, players, 'moveDown');
  });

  return router;
};