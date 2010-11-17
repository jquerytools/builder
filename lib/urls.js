var views = require('./views');

module.exports = {
    'GET /': views.versionList,
    'GET /:version/jquery.tools.min.js': views.build
};
