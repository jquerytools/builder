// UI tools, no jQuery
exports['tiny'] = {
    jquery: false,
    files: [
        'tabs/tabs.js',
        'tooltip/tooltip.js',
        'scrollable/scrollable.js',
        'overlay/overlay.js'
    ]
};

// Form tools, no jQuery
exports['form'] = {
    jquery: false,
    files: [
        'dateinput/dateinput.js',
        'rangeinput/rangeinput.js',
        'validator/validator.js'
    ]
};

// All tools, no jQuery
exports['all'] = {
    jquery: false,
    files: [
        'tooltip/tooltip.js',
        'tooltip/tooltip.dynamic.js',
        'tooltip/tooltip.slide.js',
        'tabs/tabs.js',
        'tabs/tabs.slideshow.js',
        'toolbox/toolbox.history.js',
        'toolbox/toolbox.mousewheel.js',
        'toolbox/toolbox.flashembed.js',
        'toolbox/toolbox.expose.js',
        'scrollable/scrollable.autoscroll.js',
        'scrollable/scrollable.navigator.js',
        'scrollable/scrollable.js',
        'dateinput/dateinput.js',
        'validator/validator.js',
        'overlay/overlay.js',
        'overlay/overlay.apple.js',
        'rangeinput/rangeinput.js'
    ]
};

// UI tools with jQuery
exports['default'] = {
    jquery: true,
    files: exports.tiny.files
};

// All tools with jquery
exports['full'] = {
    jquery: true,
    files: exports.all.files
};
