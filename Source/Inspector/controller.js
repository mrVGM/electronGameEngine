var controller = {
    selected: undefined,
    events: {
        registered: false,
        select: function (e) {
            var target = e.target;
            var gameObject = target.getAttribute('game-object-entry');
            if (gameObject) {
                var id = parseInt(gameObject);
                var hierarchy = require('../HIerarchy/controller');
                var go = hierarchy.viewToGameObjectsMap[id];
                controller.selected = go;
                var init = require('../init');
                var sws = init.parent.querySelectorAll('[subwindow]');
                var swController = require('../Layout/controller');

                for (var i = 0; i < sws.length; ++i) {
                    var curElem = sws[i].getAttribute('subwindow');
                    curElem = parseInt(curElem);
                    var sw = swController.viewToModelMap[curElem];

                    if (sw.windowType === 'inspector') {
                        sw.contentController.currentInspector = undefined;
                        sw.contentController.render();
                    }
                }
                return true;
            }
            return false;
        },
        registerEvents: function () {
            if (controller.events.registered) {
                return;
            }
            controller.events.registered = true;

            var events = require('../events');
            events.eventHandlers.mouseClick.push(controller.events.select);
        }
    },
    create: function () {
        controller.events.registerEvents();
        var ctrl = {
            currentInspector: undefined,
            render: function () {
                var init = require('../init');
                var rootElement = init.parent;

                var wnd = rootElement.querySelector('[subwindow="' + ctrl.subwindowId + '"]');

                var windowTypes = wnd.querySelectorAll('[window-type]');
                for (var i = 0; i < windowTypes.length; ++i) {
                    var cur = windowTypes[i];
                    cur.className = "positionable unselectable";
                    if (cur.getAttribute('window-type') === 'inspector') {
                        cur.className += ' selected';
                    }
                }

                wnd = wnd.querySelector('[subwindow-content]');

                while (wnd.firstChild) {
                    wnd.removeChild(wnd.firstChild);
                }

                if (!ctrl.currentInspector) {
                    var insp = require('./gameObjectInspector');
                    ctrl.currentInspector = insp.create(controller.selected);
                }
                ctrl.currentInspector.render(function (html) {
                    wnd.innerHTML = html;
                });
            },
        };
        return ctrl;
    }
};

module.exports = controller;