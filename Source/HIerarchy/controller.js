var views = undefined;
var viewDir = __dirname + '\\Views\\';
var contextMenuView = 'contextMenu.html';
var renameView = 'renameView.html';
var viewFilenames = [contextMenuView, renameView];

var controller = {
    viewToGameObjectsMap: {},
    refresh: function () {
        var init = require('../init');
        var parent = init.parent;
        var sws = parent.querySelectorAll('[subwindow]');

        var subwindow = require('../Layout//controller');
        for (var i = 0; i < sws.length; ++i) {
            var cur = sws[i];
            var id = cur.getAttribute('subwindow');
            id = parseInt(id);
            var sw = subwindow.viewToModelMap[id];
            if (sw.windowType === 'hierarchy') {
                sw.contentController.render();
                sw.contentController.state.setState(sw.contentController.states.def);
            }
        }
    },
    create: function () {
        var utils = require('../utils');
        utils.readFiles(viewDir, viewFilenames, function (res) {
            views = res;
        });

        var st = require('../State/state');

        var guid = require('../EventHandling/guidGen');

        var ctrl = {
            subwindowId: undefined,
            expandedMap: {},
            eventPool: undefined,
            stateContext: {},
            state: st.create(),
            states: {
                def: {
                    dropFileObject: undefined,
                    dragFileObjectListener: {
                        priority: 0,
                        handle: function(evt) {
                            if (evt.type !== 'dragFileObject') {
                                return false;
                            }

                            var fe = evt.fileObject;
                            ctrl.states.def.dropFileObject = {
                                priority: 0,
                                handle: function(e) {
                                    if (e.type !== 'mouseup') {
                                        return false;
                                    }
                                    var target = e.target;
                                    if (!target.getAttribute('subwindow')) {
                                        return false;
                                    }

                                    var fs = require('fs');
                                    var projectModel = require('../Project/model');
                                    fs.readFile(projectModel.getProjectFolder() + fe.path, function(err, data) {
                                        data = data.toString();
                                        var go = JSON.parse(data);
                                        var gameObject = require('./gameObject');
                                        gameObject.deserialize(go);
                                        ctrl.viewToModelMap = {};
                                        var model = require('./model');
                                        model.root = go;

                                        controller.refresh();
                                    });

                                    console.log('Opening prefab', fe);
                                    return true;
                                }
                            };

                            ctrl.eventPool.add(ctrl.states.def.dropFileObject);

                            return true;
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
                        id: guid.generateId()
                    },

                    enterState: function() {
                        ctrl.eventPool.clear();
                        ctrl.eventPool.add({
                            priority: 0,
                            handle: function (e) {
                                if (e.type !== 'contextmenu') {
                                    return false;
                                }
        
                                var target = e.target;
                                var gme = target.getAttribute('game-object-entry');
                                if (!gme) {
                                    return false;
                                }
                                if (!views) {
                                    return false;
                                }
                    
                                var ejs = require('ejs');
                    
                                var contextMenuPlace = target.querySelector('[context-menu-place]');
                                while (contextMenuPlace.firstChild) {
                                    contextMenuPlace.removeChild(contextMenuPlace.firstChild);
                                }
                    
                                var goId = parseInt(gme);
                    
                                var go = controller.viewToGameObjectsMap[goId];
                    
                                contextMenuPlace.innerHTML = ejs.render(views[contextMenuView], { gm: go });
                    
                                contextMenuPlace.style.left = e.offsetX + 'px';
                                contextMenuPlace.style.top = e.offsetY + 'px';

                                ctrl.state.setState(ctrl.states.modal);
                            }
                        });

                        ctrl.eventPool.add({
                            priority: 0,
                            handle: function (e) {
                                if (e.type !== 'click') {
                                    return false;
                                }
                                var target = e.target;
                                var go = target.getAttribute('game-object-expand-button');
                                if (!go) {
                                    return false;
                                }
                                go = parseInt(go);
                    
                                var goEl = target;
                                while (!goEl.getAttribute('subwindow')) {
                                    goEl = goEl.parentElement;
                                }
                                var sw = goEl.getAttribute('subwindow');
                                sw = parseInt(sw);
                                var sws = require('../Layout/controller');
                                sw = sws.viewToModelMap[sw];
                                sw.contentController.expandedMap[go] = !sw.contentController.expandedMap[go];
                                controller.refresh();
                                return true;
                            }
                        });

                        ctrl.eventPool.add({
                            priority: 0,
                            handle: function(e) {
                                if (e.type !== 'mousedown') {
                                    return false;
                                }
                                if (e.button !== 0) {
                                    return false;
                                }
                    
                                var target = e.target;
                                var goID = target.getAttribute('game-object-entry');
                                if (!goID) {
                                    return false;
                                }
                    
                                goID = parseInt(goID);
                                var go = controller.viewToGameObjectsMap[goID];

                                ctrl.stateContext.dragging = { gameObject: go };
                                ctrl.state.setState(ctrl.states.dragging);
                            }
                        });

                        ctrl.eventPool.add({
                            priority: 0,
                            handle: function(e) {
                                if (e.type !== 'click') {
                                    return false;
                                }
                                if (e.button !== 0) {
                                    return false;
                                }
                                var target = e.target;
                                var goID = target.getAttribute('game-object-entry');
                                if (!goID) {
                                    return false;
                                }
                                goID = parseInt(goID);
                                var go = controller.viewToGameObjectsMap[goID];

                                var eventManager  = require('../EventHandling/eventManager');
                                eventManager.raiseCustomEvent({ type: 'gameObjectSelect', gameObject: go });
                                return true;
                            }
                        });

                        var eventManager = require('../EventHandling/eventManager');
                        eventManager.addCustom(ctrl.states.def.dragFileObjectListener);
                        eventManager.addCustom(ctrl.states.def.dropFileObjectListener);
                    },
                    exitState: function() {
                        var eventManager = require('../EventHandling/eventManager');
                        eventManager.removeCustom(ctrl.states.def.dragFileObjectListener);
                        eventManager.removeCustom(ctrl.states.def.dropFileObjectListener);
                    }
                },
                dragging: {
                    dropHandler: undefined,
                    enterState: function() {
                        ctrl.eventPool.clear();
                        var eventManager = require('../EventHandling/eventManager');
                        ctrl.states.dragging.dropHandler = {
                            priority: -1000,
                            handle: function(e) {
                                if (e.type !== 'mouseup') {
                                    return false;
                                }
                                eventManager.raiseCustomEvent({ type: 'dropGameObject' });
                                ctrl.state.setState(ctrl.states.def);
                                return false;
                            },
                            id: guid.generateId(),
                        };

                        var eventManager = require('../EventHandling/eventManager');
                        eventManager.raiseCustomEvent({type: 'dragGameObject', gameObject: ctrl.stateContext.dragging.gameObject });

                        eventManager.addGlobal(ctrl.states.dragging.dropHandler);
                    },
                    exitState: function() {
                        var eventManager = require('../EventHandling/eventManager');
                        eventManager.removeGlobal(ctrl.states.dragging.dropHandler);
                        ctrl.states.dragging.dropHandler = undefined;
                    },
                },
                modal: {
                    enterState: function() {
                        ctrl.eventPool.clear();

                        ctrl.eventPool.add({
                            priority: 0,
                            handle: function (e) {
                                if (e.type !== 'click') {
                                    return false;
                                }

                                var target = e.target;
                                if (target.getAttribute('hierarchy-context-menu') === 'Create') {
                    
                                    var sw = target;
                                    while (!sw.getAttribute('subwindow')) {
                                        sw = sw.parentElement;
                                    }
                                    var swId = sw.getAttribute('subwindow');
                                    swId = parseInt(swId);
                                    var sws = require('../Layout/controller');
                                    sw = sws.viewToModelMap[swId];
                    
                                    var id = target.getAttribute('id');
                                    id = parseInt(id);
                                    var go = controller.viewToGameObjectsMap[id];
                                    var newGO = sw.contentController.createGameObject();
                                    go.children.push(newGO);
                                    newGO.parent = go;
                                    controller.refresh();
                                    ctrl.state.setState(ctrl.states.def);
                                    return true;
                                }
                                return false;
                            }
                        });
                        
                        ctrl.eventPool.add({
                            priority: 0,
                            handle: function (e) {
                                if (e.type !== 'click') {
                                    return false;
                                }

                                var target = e.target;
                                if (target.getAttribute('hierarchy-context-menu') === 'Delete') {
                                    var sw = target;
                                    while (!sw.getAttribute('subwindow')) {
                                        sw = sw.parentElement;
                                    }
                                    var swId = sw.getAttribute('subwindow');
                                    swId = parseInt(swId);
                                    var sws = require('../Layout/controller');
                                    sw = sws.viewToModelMap[swId];
                    
                                    var id = target.getAttribute('id');
                                    id = parseInt(id);
                                    var go = controller.viewToGameObjectsMap[id];
                                    sw.contentController.deleteGameObject(go);

                                    controller.refresh();
                                    ctrl.render();
                                    ctrl.state.setState(ctrl.states.def);

                                    return true;
                                }
                                return false;
                            }
                        });
                        
                        ctrl.eventPool.add({
                            priority: 0,
                            handle: function (e) {
                                if (e.type !== 'click') {
                                    return false;
                                }

                                var target = e.target;
                                if (target.getAttribute('hierarchy-context-menu') === 'Rename') {
                                    var sw = target;
                                    while (!sw.getAttribute('subwindow')) {
                                        sw = sw.parentElement;
                                    }
                                    var swId = sw.getAttribute('subwindow');
                                    swId = parseInt(swId);
                                    var sws = require('../Layout/controller');
                                    sw = sws.viewToModelMap[swId];
                    
                                    var id = target.getAttribute('id');
                                    id = parseInt(id);
                                    
                                    while (!target.getAttribute('game-object-entry')) {
                                        target = target.parentElement;
                                    }

                                    ctrl.stateContext.renaming = { elem: target, goId: id};
                                    ctrl.state.setState(ctrl.states.renameGO);

                                    return true;
                                }
                                return false;
                            }
                        });

                        ctrl.eventPool.add({
                            priority: 10,
                            handle: function(e) {
                                if (e.type === 'keypress') {
                                    return false;
                                }
                                if (e.type === 'mousemove') {
                                    return false;
                                }
                                var target = e.target;
                                var menuItem = target.getAttribute('hierarchy-context-menu');
                                if (!menuItem) {
                                    ctrl.state.setState(ctrl.states.def);
                                    ctrl.render();
                                    return true;
                                }
                                return false;
                            }
                        });
                    },
                    exitState: function() {}
                },
                renameGO: {
                    enterState: function() {
                        ctrl.eventPool.clear();

                        var go = controller.viewToGameObjectsMap[ctrl.stateContext.renaming.goId];
                        var target = ctrl.stateContext.renaming.elem;

                        while (target.firstChild) {
                            target.removeChild(target.firstChild);
                        }
        
                        var ejs = require('ejs');
                        target.innerHTML = ejs.render(views[renameView], { go: go });
        
                        var renameInput = target.querySelector('[rename-game-object]');
                        renameInput.value = go.name;

                        ctrl.eventPool.add({
                            priority: 0,
                            handle: function(e) {
                                if (e.type !== 'keypress') {
                                    return false;
                                }
                                
                                if (e.key === 'Enter' && renameInput.value !== '') {
                                    go.name = renameInput.value;
                                    controller.refresh();
                                    ctrl.render();
                                    ctrl.state.setState(ctrl.states.def);
                                }
                                return true;
                            }
                        });
                    },
                    exitState() {
                    }
                },
                disabled: {
                    enterState: function() {},
                    exitState: function() {}
                },
            },
            isExpanded: function (id) {
                if(ctrl.expandedMap[id]) {
                    return true;
                }
                ctrl.expandedMap[id] = false;
                return false;
            },
            createGameObject: function () {
                var gameObject = require('./gameObject');
                var gm = gameObject.create();
                controller.viewToGameObjectsMap[gm.id] = gm;
                return gm;
            },
            deleteGameObject: function (go) {
                if (!go.parent) {
                    return;
                }

                var parent = go.parent;
                var index = parent.children.indexOf(go);
                parent.children.splice(index, 1);

                controller.viewToGameObjectsMap[go.id] = undefined;
            },
            init: function (callback) {
                var model = require('./model');
                if (!model.root) {
                    var rootObject = ctrl.createGameObject();
                    model.root = rootObject;
                }

                var eventPool = require('../EventHandling/eventPool');
                ctrl.eventPool = eventPool.create();

                ctrl.state.setState(ctrl.states.def);

                var go = require('./gameObject');
                go.init(callback);
            },
            render: function () {
                var init = require('../init');
                var rootElement = init.parent;

                var wnd = rootElement.querySelector('[subwindow="' + ctrl.subwindowId + '"]');

                var windowTypes = wnd.querySelectorAll('[window-type]');
                for (var i = 0; i < windowTypes.length; ++i) {
                    var cur = windowTypes[i];
                    cur.className = "positionable unselectable";
                    if (cur.getAttribute('window-type') === 'hierarchy') {
                        cur.className += ' selected';
                    }
                }


                wnd = wnd.querySelector('[subwindow-content]');

                while (wnd.firstChild) {
                    wnd.removeChild(wnd.firstChild);
                }

                var model = require('./model');

                wnd.innerHTML = model.root.render(ctrl);
            },
            getRoot: function () {
                var model = require('./model');
                return model.root;
            },
            disable: function() {
                ctrl.state.setState(ctrl.states.disabled);
            }
        };
        return ctrl;
    }
};

module.exports = controller;