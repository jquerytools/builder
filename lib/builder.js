/**
 * Module dependencies
 */

var jsp = require('../deps/UglifyJS/lib/parse-js'),
    pro = require('../deps/UglifyJS/lib/process'),
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
 * Exports all blobs below path for a give tag, commit or branch to
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
        var filename = _path.join(output_dir, blob.path);
        var dirname = _path.dirname(filename);

        util.ensureDir(dirname, function (err) {
            if (err) return cb(err);
            fs.writeFile(filename, min, cb);
        });

    }, callback);
};
