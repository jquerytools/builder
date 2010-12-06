var views = require('./views');

module.exports = {
    'GET  /': views.versionList,
    'POST /post_receive': views.postReceiveHook,
    'GET  /:version/jquery.tools.min.js': views.build
};
