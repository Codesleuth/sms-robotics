var winston = require('winston');

var consoleLogger = new (winston.transports.Console)({
  level: 'debug',
  timestamp: true,
  handleExceptions: false,
  colorize: true
});

var logger = new (winston.Logger)({
  transports: [consoleLogger],
  exitOnError: true
});

module.exports = {
  info: function () {
    var args = ['info'].concat(Array.prototype.slice.call(arguments));
    logger.log.apply(logger, args);
  },

  error: function () {
    var args = ['error'].concat(Array.prototype.slice.call(arguments));
    logger.log.apply(logger, args);
  }
};

module.exports.console = {
  disable: function () {
    logger.remove(consoleLogger);
  },
  enable: function () {
    logger.add(consoleLogger, null, true);
  }
};

module.exports.middleware = function () {
  var morgan = require('morgan');
  var stream = {
    write: function (message, encoding) {
      logger.info(message);
    }
  };
  return morgan("dev", {stream: stream});
};