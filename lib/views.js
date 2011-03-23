var connect = require('../deps/connect/lib/connect'),
    builder = require('./builder'),
    util = require('./util'),
    urlParse = require('url').parse,
    urlFormat = require('url').format,
    packages = require('./packages'),
    exec = require('child_process').exec,
    sys = require('sys'),
    fs = require('fs');


exports.versionList = function (req, res, next) {
    var url = urlParse(req.url, 1);
    fs.readdir(__dirname + '/../minified', function (err, files) {
        if (err) return next(err);
        if (url.query.callback) {
            res.jsonp(url.query.callback, {versions: files.sort()});
        }
        else {
            res.json({versions: files.sort()});
        }
    });
};


exports.build = function (req, res, next, version) {
    var url = urlParse(req.url, 1);
    var files = (url.query ? url.query.t: []) || [];
    var build = url.query ? url.query.build: null;
    var include_jquery = url.query ? url.query.include_jquery: false;

    // force files to an array
    if (!Array.isArray(files)) {
        files = [files];
    }
    if (files.length && build) {
        return res.forbidden().text(
            'Error: this service only accepts "t" OR "build" parameters'
        );
    }
    if (!files.length && !build) {
        build = 'default';
    }
    if (build) {
        var pkg = packages[build];
        if (!pkg) {
            return res.forbidden().text(
                "Error: build '" + build + "' does not exist"
            );
        }
        files = pkg.files;
        include_jquery = include_jquery || pkg.jquery;
    }

    builder.concat(version, files, include_jquery, function (err, build) {
        if (err) return next(err);
        var h = {
             "Content-Length": build.length,
             "content-disposition": 'attachment;filename="jquery.tools.min.js"'
        };
        res.headers(h).javascript(build);
    });
};

exports.postReceiveHook = function (req, res, next) {
    console.log('exec: ' + __dirname + '/../bin/update');
    exec(__dirname + '/../bin/update', function (err, stdout, stderr) {
        if (err) {
            console.error(err.stack || err);
            return res.error().text(err.stack || err);
        }
        if (stdout) console.log('stdout: ' + stdout);
        if (stderr) console.error('stderr: ' + stderr);
        res.ok().text('OK');
    });
};

exports.info = function (req, res, next, version) {
    var url = urlParse(req.url, 1);
    util.readJSON(__dirname + '/../minified/info.json', function (err, info) {
        if (err) {
            console.error(err.stack || err);
            return res.error().text(err.stack || err);
        }
        if (url.query.callback) {
            res.jsonp(url.query.callback, info[version]);
        }
        else {
            res.json(info[version]);
        }
    });
};
