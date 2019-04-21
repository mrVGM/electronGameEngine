var events = {
    eventHandlers: {
        mouseDown: [],
        mouseUp: [],
        mouseMove: [],
        mouseClick: [],
        contextMenu: [],
    },
    handleEvent(e) {
        if (e.type === 'mousemove') {
            for (var i = 0; i < events.eventHandlers.mouseMove.length; ++i) {
                var cur = events.eventHandlers.mouseMove[i];
                if (cur(e)) {
                    return;
                }
            }
            return;
        }
        if (e.type === 'mousedown') {
            for (var i = 0; i < events.eventHandlers.mouseDown.length; ++i) {
                var cur = events.eventHandlers.mouseDown[i];
                if (cur(e)) {
                    return;
                }
            }
            return;
        }
        if (e.type === 'mouseup') {
            for (var i = 0; i < events.eventHandlers.mouseUp.length; ++i) {
                var cur = events.eventHandlers.mouseUp[i];
                if (cur(e)) {
                    return;
                }
            }
            return;
        }
        
        if (e.type === 'click') {
            for (var i = 0; i < events.eventHandlers.mouseClick.length; ++i) {
                var cur = events.eventHandlers.mouseClick[i];
                if (cur(e)) {
                    return;
                }
            }
            return;
        }

        if (e.type === 'contextmenu') {
            for (var i = 0; i < events.eventHandlers.contextMenu.length; ++i) {
                var cur = events.eventHandlers.contextMenu[i];
                if (cur(e)) {
                    return;
                }
            }
            return;
        }
    }
}

module.exports = events;