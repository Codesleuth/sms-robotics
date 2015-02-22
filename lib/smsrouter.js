var io = require('socket.io-client'),
    log = require('./logger');

var joinRegex = /^(?:JOIN|JOIN\s)(.*)$/i;
var leftRegex = /^(?:LEFT|L)$/i;
var rightRegex = /^(?:RIGHT|R)$/i;
var upRegex = /^(?:UP|U)$/i;
var downRegex = /^(?:DOWN|D)$/i;
var leaveRegex = /^LEAVE$/i;

function SmsRouter(players) {
  this.players = players;
  this.io = io('https://push-esendex.rhcloud.com/');
  this.accountId = process.env.ACCOUNT_ID;

  var self = this;

  this.io.on('connect', function () {
    self.io.emit('accountid', self.accountId);
  }).on('accountid', function (accountId) {
    log.info('Listening to Esendex Push with account ID %s', accountId);
  }).on('inbound', self.handleInbound.bind(self));
}

SmsRouter.prototype.handleInbound = function (message) {
  var text = message.push.MessageText;
  var originator = message.push.From;

  log.info('Received SMS from %s: %s', originator, text);

  var existingPlayer = this.players.findById(originator);
  
  var joinMatch = text.match(joinRegex);
  log.info(joinMatch);
  if (existingPlayer === null && joinMatch !== null) {
    return this.handleJoin(originator, joinMatch[1]);
  }

  log.info('is left', leftRegex.test(text));

  if (leftRegex.test(text)) return existingPlayer.moveLeft();
  if (rightRegex.test(text)) return existingPlayer.moveRight();
  if (upRegex.test(text)) return existingPlayer.moveUp();
  if (downRegex.test(text)) return existingPlayer.moveDown();
};

SmsRouter.prototype.handleJoin = function (originator, name) {
  log.info('Adding player with id %s', originator);
  var newPlayer = this.players.new(originator);
  if (name) {
    newPlayer.setName(name);
  }
};

module.exports = function (players) {
  return new SmsRouter(players);
};