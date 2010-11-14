/**
 * Module dependencies
 */

var child_process = require('child_process');


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
