var git = require('../lib/git'),
    nodeunit = require('../deps/nodeunit');


module.exports = nodeunit.testCase({

    setUp: function (callback) {
        this._cmd = git.cmd;
        callback();
    },
    tearDown: function (callback) {
        git.cmd = this._cmd;
        callback();
    },

    'parse tag list': function (test) {
        test.expect(3);
        git.cmd = function (wd, commands, callback) {
            test.equal(wd, 'working_dir');
            test.same(commands, ['tag']);
            callback(null, 'v1.2.0\nv1.2.1\nv1.2.2\nv1.2.3\nv1.2.4\nv1.2.5\n');
        };
        git.getTags('working_dir', function (err, tags) {
            test.same(tags, [
                'v1.2.0',
                'v1.2.1',
                'v1.2.2',
                'v1.2.3',
                'v1.2.4',
                'v1.2.5'
            ]);
            test.done();
        });
    }

});
