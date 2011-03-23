/**
 * Module dependencies
 */

var child_process = require('child_process'),
    path = require('path'),
    fs = require('fs');


/**
 * Ensures a directory exists using mkdir -p.
 *
 * @param {String} path
 * @param {Function} callback
 * @api public
 */

exports.ensureDir = function (path, callback) {
    var mkdir = child_process.spawn('mkdir', ['-p', path]);
    mkdir.on('error', function (err) {
        callback(err);
        callback = function(){};
    });
    mkdir.on('exit', function (code) {
        if (code === 0) callback();
        else callback(new Error('mkdir exited with code: ' + code));
    });
};


/**
 * Returns the absolute path 'p1' relative to the absolute path 'p2'. If 'p1'
 * is already relative it is returned unchanged.
 *
 * @param {String} p1
 * @param {String} p2
 * @return {String}
 * @api public
 */

exports.relpath = function (p1, p2) {
    var p1n = path.normalize(p1).split('/'),
        p2n = path.normalize(p2).split('/');

    // if path is not absolute return it unchanged
    if(p1n[0] !== '') return p1;

    while (p1n.length && p2n.length && p1n[0] === p2n[0]) {
        p1n.shift();
        p2n.shift();
    }

    // if p1 is not a sub-path of p2, then we need to add some ..
    for (var i = 0; i < p2n.length; i++) {
        p1n.unshift('..');
    };

    return path.join.apply(null, p1n);
};

/**
 * Read a file from the filesystem and parse as JSON
 *
 * @param {String} path
 * @param {Function} callback
 * @api public
 */

exports.readJSON = function (path, callback) {
    fs.readFile(path, function (err, content) {
        var val;
        if (err) {
            return callback(err);
        }
        try {
            val = JSON.parse(content.toString());
        }
        catch (e) {
            var stack = e.stack.split('\n').slice(0, 1);
            stack = stack.concat(['\tin ' + path]);
            e.stack = stack.join('\n');
            return callback(e, null);
        }
        callback(null, val);
    });
};
