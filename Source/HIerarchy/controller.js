var views = undefined;
var viewDir = __dirname + '\\Views\\';
var contextMenuView = 'contextMenu.html';
var renameView = 'renameView.html';
var viewFilenames = [contextMenuView, renameView];

var controller = {
    events: {
        setup: false,
        contextMenuPlace: undefined,
        closeContextMenu: undefined,
        drag: function (e) {
            if (e.button !== 0) {
                return false;
            }

            var target = e.target;
            var goID = target.getAttribute('game-object-entry');
            if (!goID) {
                return false;
            }

            goID = parseInt(goID);

            var events = require('../events');

            var drop = function (e) {
                var index = events.eventHandlers.mouseUp.indexOf(drop);
                events.eventHandlers.mouseUp.splice(index, 1);

                var target = e.target;

                if (target.getAttribute('game-object-param')) {
                    var params = require('../API/params');
                    var param = params.findParam(target);
                    param.value = goID;

                    var utils = require('../utils');
                    var sw = utils.findSubWindow(target);
                    var contentController = sw.contentController;
                    contentController.render();

                    return true;
                }
                if (target.getAttribute('file-entry')) {
                    var fileID = target.getAttribute('file-entry');
                    fileID = parseInt(fileID);
                    var projectModel = require('../Project/model');
                    var fe = projectModel.fileEntries[fileID];
                    if (fe.isFolder()) {
                        var prefabName = fe.path + '\\Prefab';
                        var fs = require('fs');
                        if (fs.existsSync(projectModel.getProjectFolder() + prefabName + '.prefab')) {
                            var index = 0;
                            while (fs.existsSync(projectModel.getProjectFolder() + prefabName + index + '.prefab')) {
                                ++index;
                            }
                        }

                        var go = controller.viewToGameObjectsMap[goID];

                        console.log(go);

                        fs.writeFile(projectModel.getProjectFolder() + prefabName + '.prefab', JSON.stringify(go.serializable()), function () {
                            var fe = require('../Project/fileEntry');
                            fe.create(prefabName + '.prefab');
                            projectModel.flush();

                            var utils = require('../utils');
                            var sw = utils.findSubWindow(target);
                            sw.contentController.render();
                        });

                    }
                    return true;
                }
                return true;
            }

            events.eventHandlers.mouseUp.unshift(drop);

            return true;
        },
    },
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

        var ctrl = {
            subwindowId: undefined,
            expandedMap: {},
            eventPool: undefined,
            stateContext: {},
            state: st.create(),
            states: {
                def: {
                    enterState: function() {
                        ctrl.eventPool.handlers = [];
                        ctrl.eventPool.handlers.push({
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
                                controller.events.contextMenuPlace = contextMenuPlace;
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

                        ctrl.eventPool.handlers.push({
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

                        ctrl.eventPool.handlers.push({
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

                                var eventManager = require('../EventHandling/eventManager');
                                eventManager.raiseCustomEvent({type: 'dragGameObject', gameObject: go});
                                ctrl.stateContext.dragging = { gameObject: go };
                                ctrl.state.setState(ctrl.states.dragging);
                            }
                        });
                    },
                    exitState: function() {}
                },
                dragging: {
                    dropHandler: undefined,
                    enterState: function() {
                        ctrl.eventPool.handlers = [];
                        var eventManager = require('../EventHandling/eventManager');
                        ctrl.states.dragging.dropHandler = {
                            priority: -100,
                            handle: function(e) {
                                if (e.type !== 'mouseup') {
                                    return false;
                                }
                                eventManager.raiseCustomEvent({ type: 'dropGameObject' });
                                ctrl.state.setState(ctrl.states.def);
                            }
                        };
                        eventManager.addGlobal(ctrl.states.dragging.dropHandler);
                    },
                    exitState: function() {
                        var eventManager = require('../EventHandling/eventManager');
                        eventManager.removeGlobal(ctrl.states.dragging.dropHandler);
                        ctrl.states.dragging.dropHandler = undefined;
                    }
                },
                modal: {
                    enterState: function() {
                        ctrl.eventPool.handlers = [];

                        ctrl.eventPool.handlers.push({
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
                        
                        ctrl.eventPool.handlers.push({
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
                        
                        ctrl.eventPool.handlers.push({
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

                        ctrl.eventPool.handlers.push({
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
                        ctrl.eventPool.handlers = [];

                        var go = controller.viewToGameObjectsMap[ctrl.stateContext.renaming.goId];
                        var target = ctrl.stateContext.renaming.elem;

                        while (target.firstChild) {
                            target.removeChild(target.firstChild);
                        }
        
                        var ejs = require('ejs');
                        target.innerHTML = ejs.render(views[renameView], { go: go });
        
                        var renameInput = target.querySelector('[rename-game-object]');
                        renameInput.value = go.name;

                        ctrl.eventPool.handlers.push({
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
            }
        };
        return ctrl;
    }
};

module.exports = controller;