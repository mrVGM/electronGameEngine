var imports = {
    subWindows: function() {
        return require('./subWindows');
    },
    utils: function() {
        return require('./utils');
    },
    windowTypes: function() {
        return require('./windowTypes');
    },
    eventManager: function() {
        return require('./eventManager');
    },
    init: function() {
        return require('./init');
    }
};

module.exports = imports;
