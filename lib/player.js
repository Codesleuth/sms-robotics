var EventEmitter = require('events').EventEmitter,
    util = require('util');

function Player(id, name, timeoutDelay) {
  EventEmitter.call(this);

  this.timeoutDelay = timeoutDelay || 60000;
  this.timeout = null;

  this._id = id;
  this._name = name;
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
  this.emit('left');
  this.resetTimeout();
};

Player.prototype.moveRight = function () {
  this.emit('right');
  this.resetTimeout();
};

Player.prototype.moveUp = function () {
  this.emit('up');
  this.resetTimeout();
};

Player.prototype.moveDown = function () {
  this.emit('down');
  this.resetTimeout();
};

Player.prototype.setName = function (name) {
  this._name = name;
  this.emit('name', name);
  this.resetTimeout();
};

Player.prototype.getName = function () {
  return this._name;
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

module.exports = function (id, name, timeoutDelay) {
  var player = new Player(id, name, timeoutDelay);
  player.resetTimeout();
  return player;
};