var Player = require('./player'),
    Leaderboard = require('./leaderboard'),
    log = require('./logger');

function bundle(player) {
  return {
    id: player.getId(),
    name: player.getName(),
    position: player.getPosition(),
    dead: player.isDead()
  };
}

function Players(io, leaderboard) {
  this.io = io;
  this.players = {};
  this.timeoutDelay = 300000;
  this.leaderboard = leaderboard;

  io.on('sync_request', this.sync.bind(this));
  io.on('player_position_update', this.updatePlayerPosition.bind(this));
  io.on('player_death', this.playerDeath.bind(this));
  io.on('player_kill', this.playerKill.bind(this));
}

Players.prototype.sync = function () {
  var ids = Object.keys(this.players);

  var payload = ids.map(function (playerId) {
    return bundle(this[playerId]);
  }, this.players);

  this.io.send('sync_response', payload);
};

Players.prototype.updatePlayerPosition = function (data) {
  var player = this.findById(data.id);
  if (!player) return;

  var position = data.position;

  player.setPosition({
    x: position.x,
    y: position.y,
    z: position.z
  });
};

Players.prototype.playerDeath = function (playerId) {
  var player = this.findById(playerId);
  if (!player) return;

  if (player.die()) {
    this.leaderboard.addDeath(playerId, player.getName());
  }
};

Players.prototype.playerKill = function (playerId) {
  var player = this.findById(playerId);
  if (!player) return;

  player.registerKill();
  this.leaderboard.addKill(playerId, player.getName());
};

Players.prototype.new = function (id) {
  var self = this;
  var playercount = Object.keys(this.players).length
  var newPlayer = Player(id, 'Player_' + (playercount + 1), this.timeoutDelay);
  
  newPlayer.on('timeout', function () {
    log.info('%s (%s) timed out.', newPlayer.getName(), id);
    self.delete(id);
  });
  
  newPlayer.on('left', function () {
    self.io.send('player_move_left', id);
  });

  newPlayer.on('right', function () {
    self.io.send('player_move_right', id);
  });

  newPlayer.on('up', function () {
    self.io.send('player_move_up', id);
  });

  newPlayer.on('down', function () {
    self.io.send('player_move_down', id);
  });

  newPlayer.on('bomb', function () {
    self.io.send('player_bomb', id);
  });

  newPlayer.on('revive', function () {
    self.io.send('player_revive', id);
  });

  newPlayer.on('name', function () {
    self.io.send('player_name', newPlayer.getName());
  });

  this.players[id] = newPlayer;

  this.io.send('player_joined', {
    id: id,
    name: newPlayer.getName()
  });

  return newPlayer;
};

Players.prototype.delete = function (id) {
  var player = this.players[id];
  if (!player) return false;

  player.removeAllListeners();
  delete this.players[id];

  this.io.send('player_left', id);

  return true;
};

Players.prototype.findById = function (id) {
  var player = this.players[id];
  if (!player) return null;

  return player;
};

Players.prototype.list = function () {
  var ids = Object.keys(this.players);

  var list = ids.map(function (playerId) {
    return this[playerId];
  }, this.players);

  return list;
};

module.exports = function (io, leaderboard) {
  var players = new Players(io, leaderboard);
  return players;
};