var views = require('./views');

module.exports = {
    'GET  /': views.versionList,
    'GET  /info': views.info,
    'POST /post_receive': views.postReceiveHook,
    'GET  /:version/jquery.tools.min.js': views.build,
    'GET  /:version/info': views.info
};
