/**
 * Module dependencies
 */

var jsp = require('../deps/UglifyJS/lib/parse-js'),
    pro = require('../deps/UglifyJS/lib/process'),
    async = require('../deps/async'),
    util = require('./util'),
    git = require('./git'),
    fs = require('fs'),
    _path = require('path');


/**
 * Minifies javascript source code represented as a string.
 *
 * @param {String} source
 * @return {String}
 * @api public
 */

exports.minify = function (source) {
    var ast = jsp.parse(source);  // parse code and get the initial AST
    ast = pro.ast_mangle(ast);    // get a new AST with mangled names
    ast = pro.ast_squeeze(ast);   // get an AST with compression optimizations
    return pro.gen_code(ast);     // compressed code here
};


/**
 * Exports all blobs below path for a given tag, commit or branch to
 * output_dir as minified js.
 *
 * @param {String} wd
 * @param {String} treeish
 * @param {String} path
 * @param {String} output_dir
 * @param {Function} callback
 * @api public
 */

exports.exportMinified = function (wd, treeish, path, output_dir, callback) {
    git.eachBlob(wd, treeish, path, function (blob, cb) {

        var min = exports.minify(blob.data);
        var filename = _path.join(output_dir, blob.path.replace(/^src\//, ''));
        var dirname = _path.dirname(filename);

        util.ensureDir(dirname, function (err) {
            if (err) return cb(err);
            fs.writeFile(filename, min, cb);
        });

    }, callback);
};


/**
 * Exports all tags and HEAD versions of a path as minified js.
 *
 * @param {String} wd
 * @param {String} path
 * @param {String} output_dir
 * @param {Function} callback
 * @api public
 */

exports.exportAllMinified = function (wd, path, output_dir, callback) {
    git.getTags(wd, function (err, tags) {
        if (err) return callback(err);

        async.forEach(tags.concat(['HEAD']), function (treeish, cb) {
            var outdir = _path.join(output_dir, treeish);
            exports.exportMinified(wd, treeish, path, outdir, cb)
        }, callback);
    });
};
