var connect = require('../deps/connect/lib/connect'),
    builder = require('./builder'),
    urlParse = require('url').parse,
    urlFormat = require('url').format,
    sys = require('sys'),
    fs = require('fs');


exports.versionList = function (req, res, next) {
    fs.readdir(__dirname + '/../minified', function (err, files) {
        if (err) return next(err);
        res.json({versions: files.sort()});
    });
};


exports.build = function (req, res, next, version) {
    var url = urlParse(req.url, 1);
    var files = url.query ? url.query.t: [];

    // force files to an array
    if (!Array.isArray(files)) {
        files = [files];
    }
    if (files && files.length) {
        builder.concat(version, files, function (err, build) {
            if (err) return next(err);
            res.javascript(build);
        });
    }
    else res.forbidden().text('Error: Missing parameters');
};
