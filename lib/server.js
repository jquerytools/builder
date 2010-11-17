var connect = require('../deps/connect/lib/connect'),
    dispatch = require('../deps/dispatch'),
    quip = require('../deps/quip'),
    urls = require('./urls');

/**
 * Creates a new Connect server instance, loaded with the correct
 * middleware stack.
 */

exports.createServer = function () {
    return connect.createServer(
        connect.logger({format: ':date :method :url (:response-timems)'}),
        connect.cache(5000),
        quip(),
        dispatch(urls)

        // can serve individual minified files by uncommenting this line,
        // example url: /v1.2.5/dateinput/dateinput.js
        //connect.staticProvider(__dirname + '/../minified')
    );
};
