var jsp = require("../deps/UglifyJS/lib/parse-js"),
    pro = require("../deps/UglifyJS/lib/process");


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
