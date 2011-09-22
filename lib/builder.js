/**
 * Module dependencies
 */

var jsp = require('../deps/UglifyJS/lib/parse-js'),
    pro = require('../deps/UglifyJS/lib/process'),
    licenses = require('./licenses'),
    async = require('../deps/async'),
    util = require('./util'),
    git = require('./git'),
    fs = require('fs'),
    _path = require('path'),
    jquery_versions = require('./jquery_versions');


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

        var filename = _path.join(output_dir, blob.path.replace(/^src\//, ''));
        var dirname = _path.dirname(filename);
        var min = exports.minify(blob.data);
        console.log('minifying ' + treeish + ':' + blob.path);

        util.ensureDir(dirname, function (err) {
            if (err) return cb(err);
            console.log('writing ' + treeish + ':' + blob.path);
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
    async.parallel({
        tags: async.apply(git.getTags, wd),
        branches: async.apply(git.getBranches, wd)
    },
    function (err, data) {
        if (err) return callback(err);
        var trees = data.tags.concat(data.branches).concat(['HEAD']);

        async.forEach(trees, function (treeish, cb) {
            var outdir = _path.join(output_dir, treeish);
            exports.exportMinified(wd, treeish, path, outdir, cb)
        }, callback);
    });
};


/**
 * Returns the path to the correct jQuery file for the given branch.
 *
 * @param {String} branch
 * @return {String}
 * @api public
 */

exports.jQueryFile = function (branch) {
    return (jquery_versions.branches[branch] || jquery_versions['default']).path;
};


/**
 * Concatenates a list of files from a version and returns the result.
 *
 * @param {Array} files
 * @param {Function} callback
 * @api public
 */

exports.concat = function (version, files, include_jquery, callback) {
    // sorting files like this help ensure base modules are included before
    // the additional features (eg, overlay.js before overlay.apple.js)
    files = files.slice().sort(function (a, b) {
        a = a.replace(/\.js$/,'');
        b = b.replace(/\.js$/,'');
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    });
    exports.hasCore(version, function (include_core) {
        if (include_core) {
            // core.js should be included only once and at the top of the file
            for (var i = 0; i <= files.length; i += 1) {
                if (files[i] === 'core.js') {
                    files.splice(i, 1);
                    i = 0;
                }
            }
            files.unshift('core.js');
        }
        var paths = files.map(function (f) {
            return __dirname + '/../minified/' + version + '/' + f;
        });
        async.reduce(paths, '', function (build, p, cb) {
            fs.readFile(p, function (err, content) {
                if (content) {
                    var src = content.toString().replace('@VERSION', version);
                    cb(err, err ? null: build + src + ';\n');
                } else {
                    cb(err, "", "");
                }
            });
        },
        function (err, src) {
            if (err) return callback(err);
            licenses.compile(version, files, function (err, l) {
                if (err) return callback(err);
                if (include_jquery) {
                    var jqfile = exports.jQueryFile(version);
                    fs.readFile(jqfile, function (err, content) {
                        if (err) callback(err);
                        callback(null, l + content.toString() + src);
                    });
                }
                else {
                    callback(null, l + src);
                }
            });
        });
    });
};

exports.hasCore = function (version, callback) {
    console.log('testing path: ' + __dirname + '/../minified/' + version + '/core.js');
    _path.exists(__dirname + '/../minified/' + version + '/core.js', callback);
};

/**
 * Returns subdirectories contained by dir, does NOT recurse through
 * subdirectories. Callback's first argument is not an error, but the
 * results themselves!
 */

exports.getDirs = function (dir, callback) {
    fs.readdir(dir, function (err, files) {
        async.filter(files, function (f, cb) {
            fs.stat(_path.join(dir, f), function (err, stats) {
                if (err) {
                    throw err;
                }
                cb(stats.isDirectory());
            });
        },
        callback);
    });
};

/**
 * Returns an object of file sizes keyed by relative path to dir.
 */

exports.getSizes = function (dir, callback) {
    var _getSizes = function (p, callback) {
        fs.stat(p, function (err, stats) {
            if (err) {
                return callback(err);
            }
            if (stats.isDirectory()) {
                fs.readdir(p, function (err, files) {
                    if (err) {
                        return callback(err);
                    }
                    var paths = files.map(function (f) {
                        return _path.join(p, f);
                    });
                    async.concat(paths, _getSizes, function (err, files) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            callback(err, files);
                        }
                    });
                });
            }
            else if (stats.isFile()) {
                callback(null, {
                    path: util.relpath(p, dir),
                    size: stats.size
                });
            }
        });
    };
    _getSizes(dir, function (err, arr) {
        if (err) {
            return callback(err);
        }
        var sizes = arr.reduce(function (sizes, file) {
            sizes[file.path] = file.size;
            return sizes;
        }, {});
        callback(null, sizes);
    });
};

exports.jQuerySizes = function (callback) {
    var dir = __dirname + '/../deps/jquery';
    fs.readdir(dir, function (err, files) {
        if (err) {
            return callback(err);
        }
        var sizes = {};
        async.forEach(files, function (f, cb) {
            fs.stat(_path.join(dir, f), function (err, stats) {
                if (err) {
                    return cb(err);
                }
                sizes[f] = stats.size;
                cb();
            });
        },
        function (err) {
            callback(err, sizes);
        });
    });
};

/**
 * Builds the info.json file in the minified directory, used for the
 * /:version/info view.
 */

exports.buildInfo = function (dir, output_file, callback) {
    var info = {};
    exports.jQuerySizes(function (err, jquery_sizes) {
        if (err) {
            return callback(err);
        }
        exports.getDirs(dir, function (versions) {
            async.forEach(versions, function (v, cb) {
                exports.getSizes(_path.join(dir, v), function (err, sizes) {
                    if (err) {
                        return cb(err);
                    }
                    var version = util.relpath(v, dir);
                    var jq = (
                        jquery_versions.branches[version] ||
                        jquery_versions['default']
                    );
                    jq.basename = _path.basename(jq.path);
                    info[version] = {
                        sizes: sizes,
                        jquery: {
                            version: jq.version,
                            filename: jq.basename,
                            size: jquery_sizes[jq.basename]
                        }
                    };
                    cb();
                });
            },
            function (err) {
                if (err) {
                    return callback(err);
                }
                console.log('writing ' + output_file);
                fs.writeFile(output_file, JSON.stringify(info), callback);
            });
        });
    });
};
