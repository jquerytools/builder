var connect = require('../deps/connect/lib/connect'),
    urlParse = require('url').parse,
    urlFormat = require('url').format,
    fs = require('fs');


exports.versionList = function (req, res, next) {
    fs.readdir(__dirname + '/../minified', function (err, files) {
        if (err) {
            return res.error().json({
                error: err.message,
                stack: err.stack
            });
        }
        res.json({versions: files.sort()});
    });
};


// TODO: stub
exports.build = function (req, res, next, version) {
    res.text('build view stub for ' + version);
};
