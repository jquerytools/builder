/**
 * Module dependencies
 */

var async = require('../deps/async'),
    util = require('./util'),
    fs = require('fs');


LICENSE_DIR = __dirname + '/../licenses';
TOOLS_LICENSE = 'tools.txt';

ADDITIONAL_LICENSES = {
    'toolbox/toolbox.mousewheel.js': 'wheel.txt',
    'toolbox/toolbox.drag.js':       'drag.txt' // no longer used?
}

// TODO: add jquery license when build server supports bundling of jquery


/**
 * Reads a license file from the licenses directory.
 *
 * @param {String} path
 * @param {Function} callback
 * @api public
 */

exports.read = function (path, callback) {
    fs.readFile(LICENSE_DIR + '/' + path, function (err, data) {
        if (err) return callback(err);
        callback(null, data.toString());
    });
};


/**
 * Checks if file requires an additional license and loads it returning the
 * result. If the file does not require an additional license then an empty
 * string is returned
 *
 * @param {String} file
 * @param {Function} callback
 * @api public
 */

exports.forFile = function (file, callback) {
    if (file in ADDITIONAL_LICENSES) {
        return exports.read(ADDITIONAL_LICENSES[file], callback);
    }
    // no additional license for this file
    callback(null, '');
};


/**
 * Compiles relevant licenses for a list of files.
 *
 * @param {Array} files
 * @param {Function} callback
 * @api public
 */

exports.compile = function (files, callback) {
    exports.read(TOOLS_LICENSE, function (err, l) {
        if (err) return callback(err);
        async.map(files, exports.forFile, function (err, licenses) {
            if (err) return callback(err);
            callback(null, '/*!\n' + l + licenses.join('') + ' */\n');
        });
    });
};
