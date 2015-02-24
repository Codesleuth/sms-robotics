var socketio = require('socket.io'),
    log = require('./logger'),
    EventEmitter = require('events').EventEmitter,
    util = require('util');

function onDisconnected() {
  log.info('Socket.IO [%s] client disconnected', this._clientid);
}

function IoServer(io) {
  EventEmitter.call(this);

  var self = this;

  this.io = io;
  this.players = io.of('/players');
  this.players.on('connection', this.onConnected.bind(this));

  this.on('removeListener', function (event, listener) {
    log.info('Unhooking "%s" event from io...', event);
    self.players.removeListener(event, listener);
  });

  this.on('newListener', function (event, listener) {
    log.info('Hooking "%s" event to io...', event);
    self.players.on(event, listener);
  });
}

util.inherits(IoServer, EventEmitter);

IoServer.prototype.onConnected = function (socket) {
  var clientAddress = socket.request.connection._peername.address;
  var clientPort = socket.request.connection._peername.port;
  socket._clientid = clientAddress + ':' + clientPort;

  log.info('Socket.IO [%s] client connected', socket._clientid);

  socket.on('disconnect', onDisconnected);

  var self = this;
  socket.on('sync_request', function () {
    log.info('Socket.IO [%s] sync requested', socket._clientid);
    self.emit('sync_request');
  });
  socket.on('player_position_update', function (data) {
    log.info('Socket.IO [%s] player position update received', socket._clientid, data);
    self.emit('player_position_update', data);
  });
  socket.on('player_kill', function (data) {
    log.info('Socket.IO [%s] player kill received', socket._clientid, data);
    self.emit('player_kill', data);
  });
  socket.on('player_death', function (data) {
    log.info('Socket.IO [%s] player death received', socket._clientid, data);
    self.emit('player_death', data);
  });
};

IoServer.prototype.send = function (key, data) {
  log.info('IoServer sending  "%s": ', key, data);
  this.players.emit(key, data);
};

module.exports = function (server) {
  var io = socketio(server);
  return new IoServer(io);
};