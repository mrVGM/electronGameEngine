var eventPool = require('./eventPool');
var pool = eventPool.create();

var customMessagesPool = eventPool.create();

var manager = {
    addGlobal: function(handler) {
        pool.add(handler);
    },
    removeGlobal: function(handler) {
        pool.remove(handler);
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
                p.add(contentController.eventPool.handlers[i]);
            }
            for (var i = 0; i < pool.handlers.length; ++i) {
                p.add(pool.handlers[i]);
            }
        }
        
        p.handleEvent(e);
    },
    raiseCustomEvent: function(e) {
        customMessagesPool.handleEvent(e);
    },
    addCustom: function(handler) {
        customMessagesPool.add(handler);
    },
    removeCustom: function(handler) {
        customMessagesPool.remove(handler);
    }
};

module.exports = manager;