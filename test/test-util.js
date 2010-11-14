var util = require('../lib/util'),
    child_process = require('child_process'),
    path = require('path'),
    fs = require('fs');


exports['ensureDir - new dirs'] = function (test) {
    test.expect(1);
    var p = __dirname + '/fixtures/ensure_dir/some/path';
    // remove any old test data
    var dir = __dirname + '/fixtures/ensure_dir';
    var rm = child_process.spawn('rm', ['-rf', dir]);
    rm.on('error', function (err) { throw err; });
    rm.on('exit', function (code) {
        util.ensureDir(p, function (err) {
            if (err) throw err;
            path.exists(p, function (exists) {
                test.ok(exists);
                test.done();
            });
        });
    });
};

exports['ensureDir - existing dir'] = function (test) {
    test.expect(1);
    var p = __dirname + '/fixtures/existing_dir'
    fs.readdir(p, function (err, files) {
        util.ensureDir(p, function (err) {
            if (err) throw err;
            fs.readdir(p, function (err, new_files) {
                // test the contents of the directory are unchanged
                test.same(files, new_files);
                test.done();
            });
        });
    });
};
