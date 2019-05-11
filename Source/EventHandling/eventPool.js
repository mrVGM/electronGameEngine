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
                if (!handler.id) {
                    var stack = new Error().stack;
                    console.log('!!!PLEASE CREATE HANDLER ID!!!', stack);
                }
                pool.handlers.push(handler);
            },
            remove: function(handler) {
                if (!handler.id) {
                    var stack = new Error().stack;
                    console.log('!!!PLEASE CREATE HANDLER ID!!!', stack);
                }

                for (var i = 0; i < pool.handlers.length; ++i) {
                    if (pool.handlers[i].id === handler.id) {
                        pool.handlers.splice(i, 1);
                        return;
                    }
                }
            } 
        };
        return pool;
    }
};

module.exports = eventPool;