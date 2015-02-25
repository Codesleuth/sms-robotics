var log = require('./logger');

function Leaderboard() {
  this._scores = {};
}

function cloneScore(score) {
  return {
    kills: score.kills,
    deaths: score.deaths
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

function ensurePlayer(playerId, scores) {
  if (!scores[playerId]) {
    scores[playerId] = {
      kills: 0,
      deaths: 0
    };
  }
}

Leaderboard.prototype.getScores = function () {
  return cloneScores(this._scores);
};

Leaderboard.prototype.getPlayerScore = function (playerId) {
  ensurePlayer(playerId, this._scores);
  var score = this._scores[playerId];
  return cloneScore(score);
};

Leaderboard.prototype.addKill = function (playerId) {
  ensurePlayer(playerId, this._scores);
  this._scores[playerId].kills += 1;
};

Leaderboard.prototype.addDeath = function (playerID) {
  ensurePlayer(playerId, this._scores);
  this._scores[playerId].deaths += 1;
};

module.exports = function () {
  var players = new Leaderboard();
  return players;
};