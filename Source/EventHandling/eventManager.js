var eventPool = require('./eventPool');
var pool = eventPool.create();

var customMessagesPool = eventPool.create();

var manager = {
    addGlobal: function(handler) {
        pool.handlers.push(handler);
    },
    removeGlobal: function(handler) {
        var index = pool.handlers.indexOf(handler);
        if (index >= 0) {
            pool.handlers.splice(index, 1);
        }
    },
    handle: function(e) {
        var utils = require('../utils');
        var sw = utils.findSubWindow(e.target);
        var contentController = undefined;
        if (sw) {
            contentController = sw.contentController;
        }

        var p = pool;
        
        if (contentController && contentController.eventPool) {
            p = eventPool.create();
            for (var i = 0; i < contentController.eventPool.handlers.length; ++i) {
                p.handlers.push(contentController.eventPool.handlers[i]);
            }
            for (var i = 0; i < pool.handlers.length; ++i) {
                p.handlers.push(pool.handlers[i]);
            }
        }
        
        p.handleEvent(e);
    },
    raiseCustomEvent: function(e) {
        customMessagesPool.handleEvent(e);
    },
    addCustom: function(handler) {
        customMessagesPool.handlers.push(handler);
    },
    removeCustom: function(handler) {
        var index = customMessagesPool.handlers.indexOf(handler);
        if (index >= 0) {
            customMessagesPool.handlers.splice(index);
        }
    }
};

module.exports = manager;