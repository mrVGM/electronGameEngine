var eventPool = {
    create: function() {
        var pool = {
            handlers: [],
            handleEvent: function(e) {
                var sorted = [];
                for (var i = 0; i < pool.handlers.length; ++i) {
                    sorted.push(pool.handlers[i]);
                }
                for (var i = 0; i < sorted.length - 1; ++i) {
                    for (var j = 0; j < sorted.length; ++j) {
                        if (sorted[i].priority > sorted[j].priority) {
                            var tmp = sorted[i];
                            sorted[i] = sorted[j];
                            sorted[j] = tmp;
                        }
                    }
                }

                for (var i = 0; i < sorted.length; ++i) {
                    sorted[i].handle(e);
                }
            },
            clear: function() {
                pool.handlers = [];
            },
            add: function(handler) {
                pool.handlers.push(handler);
            },
            remove: function(handler) {
                var index = pool.handlers.indexOf(handler);
                if (index >= 0) {
                    pool.handlers.splice(index);
                }
            } 
        };
        return pool;
    }
};

module.exports = eventPool;