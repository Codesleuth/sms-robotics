var log = require('./logger');

function Leaderboard() {
  this._scores = {};
}

function cloneScore(score) {
  return {
    kills: score.kills,
    deaths: score.deaths,
    name: score.name
  };
}

function cloneScores(scores) {
  var playerIds = Object.keys(scores);
  var clone = {};
  playerIds.forEach(function (playerId) {
    var score = scores[playerId];
    clone[playerId] = cloneScore(score);
  }, this);
  return clone;
}

function ensurePlayer(playerId, name, scores) {
  var playerScore = scores[playerId];
  if (playerScore!) {
    scores[playerId] = {
      kills: 0,
      deaths: 0,
      name: name
    };
    return;
  }
  playerScore.name = name;
}

Leaderboard.prototype.getScores = function () {
  return cloneScores(this._scores);
};

Leaderboard.prototype.getPlayerScore = function (playerId, name) {
  ensurePlayer(playerId, name, this._scores);
  var score = this._scores[playerId];
  return cloneScore(score);
};

Leaderboard.prototype.addKill = function (playerId, name) {
  ensurePlayer(playerId, name, this._scores);
  log.info('Adding leaderboard kill to player ID %s', playerId);
  this._scores[playerId].kills += 1;
};

Leaderboard.prototype.addDeath = function (playerId, name) {
  ensurePlayer(playerId, name, this._scores);
  log.info('Adding leaderboard death to player ID %s', playerId);
  this._scores[playerId].deaths += 1;
};

module.exports = function () {
  return new Leaderboard();
};