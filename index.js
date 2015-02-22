var log = require('./lib/logger'),
    app = require('./lib/app');

var server = app();

var port = process.env.PORT || 5555;
var ip = process.env.IP || null;

server.listen(port, ip, function () {
  log.info('Server ready at %s:%d', ip || '0.0.0.0', port);
});