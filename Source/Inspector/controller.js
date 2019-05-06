var controller = {
    create: function () {
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
                    dropFileObject: undefined,
                    dragFileObjectListener: {
                        priority: 0,
                        handle: function(evt) {
                            if (evt.type !== 'dragFileObject') {
                                return;
                            }
                            var fileEntry = evt.fileObject;

                            ctrl.states.def.dropFileObject = {
                                priority: 0,
                                handle: function (e) {
                                    if (e.type !== 'mouseup') {
                                        return false;
                                    }
                                    var target = e.target;
                                    if (target.getAttribute('add-script-place')) {
                                        var model = require('../Project/model');
                                        var script = require(model.getProjectFolder() + fileEntry.path);
                    
                                        ctrl.currentInspector.selected.components.push({ script: fileEntry.id, instance: script.createInstance() });
                                        ctrl.render();
                                        return true;
                                    }

                                    if (target.getAttribute('file-object-param')) {
                                        var params = require('../API/params');
                                        var param = params.findParam(target);
                                        param.value = fileEntry.id;
                                        ctrl.render();
                                        return true;
                                    }

                                    return false;
                                }
                            }

                            ctrl.eventPool.add(ctrl.states.def.dropFileObject);
                        }
                    },
                    dropFileObjectListener: {
                        priority: 0,
                        handle: function(e) {
                            if (e.type !== 'dropFileObject') {
                                return false;
                            }
                            ctrl.eventPool.remove(ctrl.states.def.dropFileObject);
                            ctrl.states.def.dropFileObject = undefined;
                        }
                    },
                    dropGameObject: undefined,
                    dragGameObjectListener: {
                        priority: 0,
                        handle: function(evt) {
                            if (evt.type !== 'dragGameObject') {
                                return false;
                            }

                            var go = evt.gameObject;

                            ctrl.states.def.dropGameObject = {
                                priority: 0,
                                handle: function(e) {
                                    if (e.type !== 'mouseup') {
                                        return false;
                                    }

                                    var target = e.target;

                                    if (target.getAttribute('game-object-param')) {
                                        var params = require('../API/params');
                                        var param = params.findParam(target);
                                        param.value = go.id;

                                        ctrl.render();
                                        return true;
                                    }
                                    return false;
                                }
                            };

                            ctrl.eventPool.add(ctrl.states.def.dropGameObject);
                        }
                    },
                    dropGameObjectListener: {
                        priority: 0,
                        handle: function(e) {
                            if (e.type !== 'dropGameObject') {
                                return false;
                            }
                            ctrl.eventPool.remove(ctrl.states.def.dropGameObject)
                            ctrl.states.def.gameObject = undefined;
                        }
                    },
                    enterState: function() {
                        var eventManager = require('../EventHandling/eventManager');
                        eventManager.addCustom(ctrl.states.def.selectGOListener);
                        eventManager.addCustom(ctrl.states.def.dragFileObjectListener);
                        eventManager.addCustom(ctrl.states.def.dropFileObjectListener);

                        eventManager.addCustom(ctrl.states.def.dragGameObjectListener);
                        eventManager.addCustom(ctrl.states.def.dropGameObjectListener);
                    },
                    exitState: function() {
                        var eventManager = require('../EventHandling/eventManager');
                        eventManager.removeCustom(ctrl.states.def.selectGOListener);
                        eventManager.removeCustom(ctrl.states.def.dragFileObjectListener);
                        eventManager.removeCustom(ctrl.states.def.dropFileObjectListener);

                        eventManager.removeCustom(ctrl.states.def.dragGameObjectListener);
                        eventManager.removeCustom(ctrl.states.def.dropGameObjectListener);
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