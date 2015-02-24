var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    log = require('./logger'),
    moment = require('moment');

function Player(id, name, timeoutDelay) {
  EventEmitter.call(this);

  this.timeoutDelay = timeoutDelay || 60000;
  this.timeout = null;

  this._id = id;
  this._name = name;
  this._position = { x: 0, y: 0, z: 0 };
  this._kills = 0;
  this._deaths = 0;
  this._dead = false;
  this._joined = moment.utc();
}

util.inherits(Player, EventEmitter);

Player.prototype.resetTimeout = function () {
  var self = this;
  
  if (this.timeout != null)
      clearTimeout(this.timeout);

  this.timeout = setTimeout(function () {
    self.timeout = null;
    self.emit('timeout');
  }, this.timeoutDelay);
};

Player.prototype.moveLeft = function () {
  if (this._dead) {
    log.info(this + ' cannot move when dead.');
    return;
  }

  this.emit('left');
  this.resetTimeout();
};

Player.prototype.moveRight = function () {
  if (this._dead) {
    log.info(this + ' cannot move when dead.');
    return;
  }
  
  this.emit('right');
  this.resetTimeout();
};

Player.prototype.moveUp = function () {
  if (this._dead) {
    log.info(this + ' cannot move when dead.');
    return;
  }
  
  this.emit('up');
  this.resetTimeout();
};

Player.prototype.moveDown = function () {
  if (this._dead) {
    log.info(this + ' cannot move when dead.');
    return;
  }
  
  this.emit('down');
  this.resetTimeout();
};

Player.prototype.bomb = function () {
  if (this._dead) {
    log.info(this + ' cannot plant a bomb when dead.');
    return;
  }
  
  this.emit('bomb');
  this.resetTimeout();
};

Player.prototype.revive = function () {
  if (!this._dead) {
    log.info(this + ' cannot revive when not dead.');
    return;
  }
  
  this.emit('revive');
  this.resetTimeout();
  this._dead = false;
};

Player.prototype.die = function () {
  if (this._dead) {
    log.info(this + ' cannot die when already dead.');
    return;
  }

  log.info(this + ' died.');
  
  this._deaths ++;
  this._dead = true;
};

Player.prototype.setName = function (name) {
  this._name = name;
  this.emit('name', name);
  this.resetTimeout();
};

Player.prototype.getName = function () {
  return this._name;
};

Player.prototype.getKills = function () {
  return this._kills;
};

Player.prototype.getDeaths = function () {
  return this._deaths;
};

Player.prototype.registerKill = function () {
  this._kills ++;
};

Player.prototype.isDead = function () {
  return this._dead;
};

Player.prototype.getId = function () {
  return this._id;
};

Player.prototype.getPosition = function () {
  return {
    x: this._position.x,
    y: this._position.y,
    z: this._position.z
  };
};

Player.prototype.setPosition = function (position) {
  this._position = {
    x: position.x,
    y: position.y,
    z: position.z
  };
};

Player.prototype.getJoined = function () {
  return this._joined.format();
};

Player.prototype.toString = function () {
  return this._name + " (" + this._id + ")";
};

module.exports = function (id, name, timeoutDelay) {
  var player = new Player(id, name, timeoutDelay);
  player.resetTimeout();
  return player;
};