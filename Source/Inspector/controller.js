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
            eventPool: undefined,
            currentInspector: undefined,
            state: undefined,
            states: {
                def: {
                    selectGOListener: {
                        priority: -100,
                        handle: function(e) {
                            if (e.type !== 'gameObjectSelect') {
                                return false;
                            }
                            var insp = require('./gameObjectInspector');
                            ctrl.currentInspector = insp.create(e.gameObject);
                            ctrl.render();
                        }
                    },
                    enterState: function() {
                        var eventManager = require('../EventHandling/eventManager');
                        eventManager.addCustom(ctrl.states.def.selectGOListener);
                    },
                    exitState: function() {
                        var eventManager = require('../EventHandling/eventManager');
                        eventManager.removeCustom(ctrl.states.def.selectGOListener);
                    },
                },
            },
            init: function(callback) {
                var eventPool = require('../EventHandling/eventPool');
                ctrl.eventPool = eventPool.create();
                function initParams() {
                    var params = require('../API/params');
                    params.init(callback);
                }
                function initInsp() {
                    var insp = require('./gameObjectInspector');
                    insp.init(initParams);
                }
                initInsp();

                var state = require('../State/state');
                ctrl.state = state.create();

                ctrl.state = ctrl.state.setState(ctrl.states.def);
            },
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
                wnd.innerHTML = ctrl.currentInspector.render();

                var inspectorWindow = wnd.querySelector('[inspector-window]');
                if (!inspectorWindow) {
                    return;
                }

                inspectorWindow.addEventListener('change', function (e) {
                    var target = e.target;
                    if (!target.getAttribute('component-param-path')) {
                        return;
                    }
                    var params = require('../API/params');
                    params.syncValue(target);
                });
            },
        };
        return ctrl;
    }
};

module.exports = controller;