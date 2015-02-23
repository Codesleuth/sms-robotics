var io = require('socket.io-client'),
    log = require('./logger'),
    esendex = require('esendex');

var esendex_config = {
  username: process.env.ESENDEX_USERNAME,
  password: process.env.ESENDEX_PASSWORD,
  accountreference: process.env.ESENDEX_ACCOUNTREFERENCE
};
var esendex_push = process.env.ESENDEX_PUSH;
var receive_account_id = process.env.RECEIVE_ACCOUNT_ID;

var joinRegex   = /^(JOIN|JOIN\s)(.*)$/i;
var leftRegex   = /^(LEFT|L)$/i;
var rightRegex  = /^(RIGHT|R)$/i;
var upRegex     = /^(UP|U)$/i;
var downRegex   = /^(DOWN|D)$/i;
var leaveRegex  = /^LEAVE$/i;
var bombRegex   = /^(BOMB|B)$/i;
var reviveRegex = /^REVIVE$/i;

var allowedSmsOriginatorRegex = /^447[0-9]{9}$/;

function isValidUkMobileOriginator(originator) {
  return allowedSmsOriginatorRegex.test(originator);
}

function SmsRouter(players) {
  this.players = players;
  this.esendex = esendex(esendex_config);

  this.io = io(esendex_push);
  this.receive_accountId = receive_account_id;

  this.io.on('connect_error', function (err) {
    log.error('Socket.IO Unable to connect to server: %s', esendex_push);
  }).on('connect_timeout', function (err) {
    log.error('Socket.IO Timeout when connecting to server: %s', esendex_push);
  }).on('reconnect', function (number) {
    log.info('Socket.IO Reconnected (#%d) to server: %s', number, esendex_push);
  }).on('reconnect_error', function (number) {
    log.error('Socket.IO Reconnection error to server: %s', number, esendex_push);
  }).on('reconnect_failed', function () {
    log.error('Socket.IO Reconnection failed to server: %s', esendex_push);
  });

  var self = this;

  this.io.on('connect', function () {
    self.io.emit('accountid', self.receive_accountId);
  }).on('accountid', function (accountId) {
    log.info('Socket.IO Listening to Esendex Push with account ID %s', accountId);
  }).on('inbound', self.handleInbound.bind(self));
}

SmsRouter.prototype.handleInbound = function (message) {
  var text = message.push.MessageText;
  var originator = message.push.From;

  log.info('Socket.IO Received SMS from %s: %s', originator, text);

  var existingPlayer = this.players.findById(originator);
  
  var joinMatch = text.match(joinRegex);
  log.info(joinMatch);
  if (existingPlayer === null && joinMatch !== null) {
    return this.handleJoin(originator, joinMatch[1]);
  }

  if (leaveRegex.test(text))  return this.handleLeave(existingPlayer, originator);

  if (leftRegex.test(text))   return existingPlayer.moveLeft();
  if (rightRegex.test(text))  return existingPlayer.moveRight();
  if (upRegex.test(text))     return existingPlayer.moveUp();
  if (downRegex.test(text))   return existingPlayer.moveDown();

  if (bombRegex.test(text))   return existingPlayer.bomb();
  if (reviveRegex.test(text)) return existingPlayer.revive();
};

SmsRouter.prototype.handleJoin = function (originator, name) {
  log.info('Adding player with id %s', originator);
  var newPlayer = this.players.new(originator);
  if (name) {
    newPlayer.setName(name);
  }

  // don't send SMS to non-UK mobile numbers
  if (!isValidUkMobileOriginator(originator)) return;

  var message = {
    accountreference: esendex_config.accountreference,
    message: [{
      to: originator,
      body: "Hey! Robot commands:\nLEFT, RIGHT, UP, DOWN, BOMB, REVIVE\nSend LEAVE at any time"
    }]
  };

  this.esendex.messages.send(message, function (err, response) {
    if (err) return log.error('Unable to send SMS to %s: ', originator, err);
    log.info('Courtesy "join" SMS sent to %s.', originator);
  });
};

SmsRouter.prototype.handleLeave = function (player, originator) {
  log.info('%s requested to leave', player.getName());
  this.players.delete(player.getId());

  // don't send SMS to non-UK mobile numbers
  if (!isValidUkMobileOriginator(originator)) return;

  var message = {
    accountreference: esendex_config.accountreference,
    message: [{
      to: originator,
      body: "Alright, you've been removed! Thanks for playing!"
    }]
  };

  this.esendex.messages.send(message, function (err, response) {
    if (err) return log.error('Unable to send SMS to %s: ', originator, err);
    log.info('Courtesy "leave" SMS sent to %s.', originator);
  });
};

module.exports = function (players) {
  return new SmsRouter(players);
};