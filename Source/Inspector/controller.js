var controller = {
    create: function () {
        var guid = require('../EventHandling/guidGen');
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
                        },
                        id: guid.generateId(),
                    },
                    selectSOListener: {
                        priority: -100,
                        handle: function (e) {
                            if (e.type !== 'scriptableObjectSelect') {
                                return false;
                            }
                            var insp = require('./scrptableObjectInspector');
                            ctrl.currentInspector = insp.create(e.scriptableObject);
                            ctrl.render();
                        },
                        id: guid.generateId(),
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
                                        var utils = require('../utils');
                                        var comp = { script: fileEntry.id, instance: utils.createInstance(script) };
                                        ctrl.currentInspector.addComponent(comp);
                                        ctrl.render();
                                        return true;
                                    }

                                    if (target.getAttribute('file-object-param')) {
                                        var params = require('../API/params');
                                        var param = params.findParam(target);
                                        param.value = fileEntry.id;
                                        ctrl.currentInspector.flushChanges();
                                        ctrl.render();
                                        return true;
                                    }

                                    return false;
                                },
                                id: guid.generateId(),
                            };

                            ctrl.eventPool.add(ctrl.states.def.dropFileObject);
                        },
                        id: guid.generateId(),
                    },
                    dropFileObjectListener: {
                        priority: 0,
                        handle: function(e) {
                            if (e.type !== 'dropFileObject') {
                                return false;
                            }
                            ctrl.eventPool.remove(ctrl.states.def.dropFileObject);
                            ctrl.states.def.dropFileObject = undefined;
                        },
                        id: guid.generateId(),
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

                                        ctrl.currentInspector.flushChanges();
                                        ctrl.render();
                                        return true;
                                    }
                                    return false;
                                },
                                id: guid.generateId(),
                            };

                            ctrl.eventPool.add(ctrl.states.def.dropGameObject);
                        },
                        id: guid.generateId(),
                    },
                    dropGameObjectListener: {
                        priority: 0,
                        handle: function(e) {
                            if (e.type !== 'dropGameObject') {
                                return false;
                            }
                            ctrl.eventPool.remove(ctrl.states.def.dropGameObject)
                            ctrl.states.def.gameObject = undefined;
                        },
                        id: guid.generateId(),
                    },
                    enterState: function() {
                        var eventManager = require('../EventHandling/eventManager');
                        eventManager.addCustom(ctrl.states.def.selectGOListener);
                        eventManager.addCustom(ctrl.states.def.selectSOListener);
                        eventManager.addCustom(ctrl.states.def.dragFileObjectListener);
                        eventManager.addCustom(ctrl.states.def.dropFileObjectListener);

                        eventManager.addCustom(ctrl.states.def.dragGameObjectListener);
                        eventManager.addCustom(ctrl.states.def.dropGameObjectListener);

                        ctrl.eventPool.add({
                            priority: 0,
                            handle: function(e) {
                                if (e.type !== 'click') {
                                    return false;
                                }
                                var target = e.target;
                                var deleteComponent = target.getAttribute('delete-component-button');
                                if (!deleteComponent) {
                                    return false;
                                }
                                deleteComponent = parseInt(deleteComponent);
                                var go = ctrl.currentInspector.selected;
                                go.components.splice(deleteComponent, 1);
                                ctrl.render();
                            },
                            id: guid.generateId()
                        });
                    },
                    exitState: function() {
                        var eventManager = require('../EventHandling/eventManager');
                        eventManager.removeCustom(ctrl.states.def.selectGOListener);
                        eventManager.removeCustom(ctrl.states.def.selectSOListener);
                        eventManager.removeCustom(ctrl.states.def.dragFileObjectListener);
                        eventManager.removeCustom(ctrl.states.def.dropFileObjectListener);

                        eventManager.removeCustom(ctrl.states.def.dragGameObjectListener);
                        eventManager.removeCustom(ctrl.states.def.dropGameObjectListener);

                        ctrl.eventPool.clear();
                    },
                },
                disabled: {
                    enterState: function() {},
                    exitState: function() {}
                }
            },
            init: function(callback) {
                var eventPool = require('../EventHandling/eventPool');
                ctrl.eventPool = eventPool.create();
                function initParams() {
                    var params = require('../API/params');
                    params.init(callback);
                }
                function initGOInsp() {
                    var insp = require('./gameObjectInspector');
                    insp.init(initParams);
                }
                function initSOInsp() {
                    var insp = require('./scrptableObjectInspector');
                    insp.init(initGOInsp);
                }

                initSOInsp();

                var state = require('../State/state');
                ctrl.state = state.create();

                ctrl.state.setState(ctrl.states.def);
            },
            render: function () {
                var init = require('../init');
                var rootElement = init.parent;

                var wnd = rootElement.querySelector('[subwindow="' + ctrl.subwindowId + '"]');

                var scrollTop = wnd.scrollTop;

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

                ctrl.currentInspector.render(wnd);
                var mutationObserver = new MutationObserver(function(mutations) {
                    var scrollable = rootElement.querySelector('[subwindow="' + ctrl.subwindowId + '"]');
                    scrollable.scrollBy({top: scrollTop});
                    mutationObserver.disconnect();
                });
                mutationObserver.observe(wnd, {attributes: false, characterData: false, childList: true});
            },
            disable: function() {
                ctrl.state.setState(ctrl.states.disabled);
            }
        };
        return ctrl;
    }
};

module.exports = controller;