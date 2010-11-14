var builder = require('../lib/builder'),
    jsp = require("../deps/UglifyJS/lib/parse-js"),
    pro = require("../deps/UglifyJS/lib/process");


exports['minify'] = function (test) {
    test.expect(5);

    var _parse = jsp.parse;
    jsp.parse = function (original) {
        test.equal(original, 'original');
        return 'parsed';
    };

    var _ast_mangle = pro.ast_mangle;
    pro.ast_mangle = function (parsed) {
        test.equal(parsed, 'parsed');
        return 'mangled';
    };

    var _ast_squeeze = pro.ast_squeeze;
    pro.ast_squeeze = function (mangled) {
        test.equal(mangled, 'mangled');
        return 'squeezed';
    };

    var _gen_code = pro.gen_code;
    pro.gen_code = function (squeezed) {
        test.equal(squeezed, 'squeezed');
        return 'minified code';
    };

    var output = builder.minify('original');
    test.equal(output, 'minified code');

    jsp.parse = _parse;
    pro.ast_mangle = _ast_mangle;
    pro.ast_squeeze = _ast_squeeze;
    pro.gen_code = _gen_code;

    test.done();
};
