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
 * @api private
 */

function cmd (wd, commands, callback) {
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
    cmd(wd, ['tag'], function (err, output) {
        if (err) return callback(err);
        callback(null, output.split('\n').slice(0, -1));
    });
};
