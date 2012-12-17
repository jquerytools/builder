/**
 * Module dependencies
 */

var async = require('../deps/async'),
    child_process = require('child_process');


/**
 * Internal helper for talking to git process, first argument is the working
 * directory of the repository you want to execute commands in. The second
 * argument is the list of commands that would normally follow 'git ' on the
 * command line.
 *
 * @param {String} wd
 * @param {Array} commands
 * @param {Function} callback
 * @api public
 */

exports.cmd = function (wd, commands, callback) {
    var child = child_process.spawn("git", commands, {cwd: wd});
    var stdout = [],
        stderr = [];

    child.stdout.setEncoding('binary');
    child.stdout.on('data', function (data) { stdout.push(data); });
    child.stderr.on('data', function (data) { stderr.push(data); });

    child.on('exit', function (code) {
        if (code > 0) {
            var command = "git " + commands.join(" ");
            var err = new Error(command + "\n" + stderr.join(''));
            return callback(err);
        }
        callback(null, stdout.join(''));
    });

    child.stdin.end();
}


/**
 * Gets an array of available tag names.
 *
 * @param {String} wd
 * @param {Function} callback
 * @api public
 */

exports.getTags = function (wd, callback) {
    exports.cmd(wd, ['tag'], function (err, output) {
        if (err) return callback(err);
        callback(null, output.split('\n').slice(0, -1));
    });
};


/**
 * Gets a list of local branches.
 *
 * @param {String} wd
 * @param {Function} callback
 * @api public
 */

exports.getBranches = function (wd, callback) {
    exports.cmd(wd, ['branch'], function (err, output) {
        if (err) return callback(err);
        var branches = output.split('\n').slice(0, -1).map(function (b) {
            return b.substr(2);
        });
        callback(null, branches);
    });
};


/**
 * Recurses through tree objects below a given path, returning all
 * blobs. The treeish argument can be a tag, commit or branch.
 *
 * @param {String} wd
 * @param {String} treeish
 * @param {String} path
 * @param {Function} callback
 * @api public
 */

exports.lsBlobs = function (wd, treeish, path, callback) {
    var command = ['ls-tree', '-r', '--full-name', treeish, path];
    exports.cmd(wd, command, function (err, output) {
        if (err) return callback(err);

        var lines = output.split('\n').slice(0, -1);
        var blobs = lines.map(function (line) {
            // FORMAT: <mode> SPACE <type> SPACE <object> TAB <file>
            var obj = {};
            var a = line.split('\t');
            var b = a[0].split(' ');
            obj.path = a[1];
            obj.mode = b[0];
            obj.type = b[1];
            obj.hash = b[2];
            return obj;
        });

        callback(null, blobs);
    });
};


/**
 * Returns the contents of a file at a given tag, commit or branch.
 *
 * @param {String} wd
 * @param {String} treeish
 * @param {String} path
 * @param {Function} callback
 * @api public
 */

exports.show = function (wd, treeish, path, callback) {
    exports.cmd(wd, ['show', treeish + ':' + path], callback);
};


/**
 * Iterate over the contents of each blob below a path for a given tag,
 * commit or branch. The callback is called once all iterators are complete.
 * The iterator functions accept 2 arguments. First, a blob object containing
 * the details from lsBlobs and a data parameter containing the blob's contents.
 * Second, a callback to call once processing is complete.
 *
 * @param {String} wd
 * @param {String} treeish
 * @param {String} path
 * @param {Function} iterator
 * @param {Function} callback
 * @api public
 */

exports.eachBlob = function (wd, treeish, path, iterator, callback) {
    exports.lsBlobs(wd, treeish, path, function (err, blobs) {
        if (err) return callback(err);

        async.forEachSeries(blobs, function (b, cb) {
            exports.show(wd, treeish, b.path, function (err, data) {
                if (err) return callback(err);
                b.data = data;
                iterator(b, cb);
            });
        }, callback);
    });
};
