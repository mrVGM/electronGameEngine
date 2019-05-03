var eventHandling = require('./eventPool');
var pool = eventHandling.create();

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
        var p = pool;
        if (sw.eventPool) {
            p = eventHandling.create();
            for (var i = 0; i < sw.eventPool.handlers.legth; ++i) {
                p.handlers.push(sw.eventPool.handlers[i]);
            }
            for (var i = 0; i < pool.handlers.legth; ++i) {
                p.handlers.push(pool.handlers[i]);
            }
        }
        
        p.handleEvent(e);
    }
};

module.exports = manager;