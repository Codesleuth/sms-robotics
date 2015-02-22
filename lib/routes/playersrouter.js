var express = require('express'),
    bodyParser = require('body-parser'),
    playerid = require('../playerid');

var textPlainHeader = { 'Content-Type': 'text/plain' };
var applicationJsonHeader = { 'Content-Type': 'application/json' };

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

function EncodePlayer(player) {
  var id = player.getId();
  return {
    id: id,
    name: player.getName(),
    links: [{
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
    }]
  };
}

module.exports = function (players) {
  var router = express.Router();

  router.get('/', function (req, res) {
    var responseArray = players.list().map(function (player) {
      return EncodePlayer(player);
    });
    res.writeHead(200, applicationJsonHeader);
    res.end(JSON.stringify(responseArray));
  });

  router.post('/', bodyParser.json(), function (req, res) {
    if (!req.body.name) {
      res.writeHead(400, textPlainHeader);
      return res.end('400: Must provide a name');
    }

    var playerId = playerid.create();
    var player = players.new(playerId);
    res.writeHead(200, applicationJsonHeader);
    res.end(JSON.stringify(EncodePlayer(player)));
  });

  router.get('/:id', function (req, res) {
    var player = players.findById(req.params.id);
    if (player) {
      res.writeHead(200, applicationJsonHeader);
      return res.end(JSON.stringify(EncodePlayer(player)));
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