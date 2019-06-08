var views = undefined;
var contextMenuView = 'contextMenu.html';
var renameInput = 'renameView.html';
var viewsFiles = [contextMenuView, renameInput];
var viewsDir = __dirname + '\\Views\\';

function repairPaths(fileEntry) {
    var model = require('./model');
    fileEntry.path = model.fileEntries[fileEntry.parent].path + '\\' + fileEntry.getName();
    if (!fileEntry.children) {
        return;
    }
    for (var i = 0; i < fileEntry.children.length; ++i) {
        repairPaths(model.fileEntries[fileEntry.children[i]]);
    }
}

var controller = {
    create: function () {
        var guid = require('../EventHandling/guidGen');

        var ctrl = {
            eventPool: undefined,
            stateContext: {},
            state: undefined,
            states: {
                def: {
                    dropGameObject: undefined,
                    dragGameObjectListener: {
                        priority: -100,
                        handle: function(evt) {
                            if (evt.type !== 'dragGameObject') {
                                return false;
                            }
                            
                            var go = evt.gameObject;

                            ctrl.states.def.dropGameObject = {
                                priority: -100,
                                handle: function(e) {
                                    if (e.type !== 'mouseup') {
                                        return false;
                                    }

                                    var target = e.target;
                                    if (!target.getAttribute('file-entry')) {
                                        return false;
                                    }

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
                                            prefabName += index;
                                        }
                
                                        fs.writeFile(projectModel.getProjectFolder() + prefabName + '.prefab', JSON.stringify(go.serializable()), function () {
                                            var fe = require('../Project/fileEntry');
                                            fe.create(prefabName + '.prefab');
                                            projectModel.flush();
                                            ctrl.render();
                                        });
                                    }

                                    return true;
                                },
                                id: guid.generateId(),
                            };

                            ctrl.eventPool.add(ctrl.states.def.dropGameObject);

                            return false;
                        },
                        id: guid.generateId()
                    },
                    dropGameObjectListener: {
                        priority: -100,
                        handle: function(evt) {
                            if (evt.type !== 'dropGameObject') {
                                return false;
                            }
                            ctrl.eventPool.remove(ctrl.states.def.dropGameObject);
                            ctrl.states.def.dropGameObject = undefined;
                            return false;
                        },
                        id: guid.generateId(),
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
                                var fileEntry = target.getAttribute('file-entry');
                                if (!fileEntry)
                                    return false;
                    
                                fileEntry = parseInt(fileEntry);
                    
                                var model = require('./model');
                                fileEntry = model.fileEntries[fileEntry];

                                ctrl.stateContext.modal = { fileEntry: fileEntry, elem: target, event: e };
                                ctrl.state.setState(ctrl.states.modal);
                                return true;
                            },
                            id: guid.generateId(),
                        });

                        ctrl.eventPool.add({
                            priority: 0,
                            handle: function (e) {
                                if (e.type !== 'click') {
                                    return false;
                                }

                                if (e.button !== 0) {
                                    return false;
                                }
                                var target = e.target;
                                var id = target.getAttribute('file-entry-expand-button');
                                if (!id) {
                                    return false;
                                }
                    
                                id = parseInt(id);
                                ctrl.expanded[id] = !ctrl.expanded[id];
                                ctrl.render();
                            },
                            id: guid.generateId(),
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
                                var fileId = target.getAttribute('file-entry');
                                if (!fileId) {
                                    return false;
                                }
                    
                                fileId = parseInt(fileId);
                                var model = require('./model');
                                var fe = model.fileEntries[fileId];

                                ctrl.stateContext.dragging = { fileEntry: fe };
                                ctrl.state.setState(ctrl.states.dragging);

                                return true;
                            },
                            id: guid.generateId(),
                        });

                        ctrl.eventPool.add({
                            priority: 0,
                            handle: function (e) {
                                
                                if (e.type !== 'click') {
                                    return false;
                                }

                                if (e.button !== 0) {
                                    return false;
                                }

                                var target = e.target;
                                var fileId = target.getAttribute('file-entry');
                                if (!fileId) {
                                    return false;
                                }
                                fileId = parseInt(fileId);
                                var model = require('./model');
                                var fe = model.fileEntries[fileId];

                                var name = fe.getName();
                                var ext = name.split('.');

                                if (ext.length === 0) {
                                    return false;
                                }
                                ext = ext[ext.length - 1];

                                if (ext !== 'asset') {
                                    return false;
                                }

                                var eventManager = require('../EventHandling/eventManager');
                                eventManager.raiseCustomEvent({ type: 'scriptableObjectSelect', scriptableObject: fe });

                                return true;
                            },
                            id: guid.generateId(),
                        });
                        
                        var eventManager = require('../EventHandling/eventManager');
                        eventManager.addCustom(ctrl.states.def.dragGameObjectListener);
                        eventManager.addCustom(ctrl.states.def.dropGameObjectListener);
                    },
                    exitState: function() {
                        var eventManager = require('../EventHandling/eventManager');
                        eventManager.removeCustom(ctrl.states.def.dragGameObjectListener);
                        eventManager.removeCustom(ctrl.states.def.dropGameObjectListener);
                    },
                },
                modal: {
                    enterState: function () {
                        var fileEntry = ctrl.stateContext.modal.fileEntry;
                        var target = ctrl.stateContext.modal.elem;

                        var ejs = require('ejs');
                        var html = ejs.render(views[contextMenuView], { fileEntry: fileEntry });

                        var contextPlace = target.querySelector('[context-menu-place]');
                        contextPlace.innerHTML = html;
                        contextPlace.style.left = ctrl.stateContext.modal.event.offsetX + 'px';
                        contextPlace.style.top = ctrl.stateContext.modal.event.offsetY + 'px';

                        ctrl.eventPool.clear();

                        ctrl.eventPool.add({
                            priority: 0,
                            handle: function (e) {
                                if (e.type !== 'click') {
                                    return false;
                                }

                                if (e.button !== 0) {
                                    return false;
                                }
                    
                                var target = e.target;
                                var menuItem = target.getAttribute('project-context-menu');
                                if (menuItem !== 'Create') {
                                    return false;
                                }
                    
                                var id = target.getAttribute('id');
                                id = parseInt(id);
                    
                                var model = require('./model');
                                var fileEntry = model.fileEntries[id];
                    
                                if (!fileEntry.isFolder()) {
                                    ctrl.state.setState(ctrl.states.def);
                                    return true;
                                }
                    
                                var fs = require('fs');
                                var newPath = fileEntry.path + '\\NewFile';
                                if (fs.existsSync(model.getProjectFolder() + newPath)) {
                                    var index = 0;
                    
                                    while (fs.existsSync(model.getProjectFolder() + newPath + index)) {
                                        ++index;
                                    }
                                    newPath += index;
                                }
                    
                                fs.writeFile(model.getProjectFolder() + newPath, '', function () {
                                    var fe = require('./fileEntry');
                                    fe.create(newPath);
                                    model.flush();

                                    ctrl.state.setState(ctrl.states.def);
                                });
                    
                                return true;
                            },
                            id: guid.generateId(),
                        });

                        ctrl.eventPool.add({
                            priority: 0,
                            handle: function (e) {
                                if (e.type !== 'click') {
                                    return false;
                                }

                                if (e.button !== 0) {
                                    return false;
                                }
                    
                                var target = e.target;
                                var menuItem = target.getAttribute('project-context-menu');
                                if (menuItem !== 'CreateFolder') {
                                    return false;
                                }
                    
                                var id = target.getAttribute('id');
                                id = parseInt(id);
                    
                                var model = require('./model');
                                var fileEntry = model.fileEntries[id];
                    
                                if (!fileEntry.isFolder()) {
                                    ctrl.state.setState(ctrl.states.def);
                                    return true;
                                }
                    
                                var fs = require('fs');
                                var newPath = fileEntry.path + '\\NewFolder';
                                if (fs.existsSync(model.getProjectFolder() + newPath)) {
                                    var index = 0;
                    
                                    while (fs.existsSync(model.getProjectFolder() + newPath + index)) {
                                        ++index;
                                    }
                                    newPath += index;
                                }
                    
                                fs.mkdir(model.getProjectFolder() + newPath, function () {
                                    var fe = require('./fileEntry');
                                    fe.create(newPath);
                                    model.flush();

                                    ctrl.state.setState(ctrl.states.def);
                                });
                    
                                return true;
                            },
                            id: guid.generateId(),
                        });

                        ctrl.eventPool.add({
                            priority: 0,
                            handle: function (e) {
                                if (e.type !== 'click') {
                                    return false;
                                }

                                if (e.button !== 0) {
                                    return false;
                                }
                    
                                var target = e.target;
                                var menuItem = target.getAttribute('project-context-menu');
                                if (menuItem !== 'Delete') {
                                    return false;
                                }
                    
                                var id = target.getAttribute('id');
                                id = parseInt(id);
                    
                                var model = require('./model');
                                var fileEntry = model.fileEntries[id];
                    
                                if (model.getAssetsFolder() === fileEntry.path) {
                                    ctrl.state.setState(ctrl.states.def);
                                    return true;
                                }
                                var files = [];
                    
                                function remove(fe, flush) {
                                    var model = require('./model');
                    
                                    if (fe.children) {
                                        for (var i = 0; i < fe.children.length; ++i) {
                                            remove(model.fileEntries[fe.children[i]], false);
                                        }
                                    }
                    
                                    var parent = model.fileEntries[fe.parent];
                                    var index = parent.children.indexOf(fe.id);
                                    parent.children.splice(index, 1);
                                    
                                    delete model.fileEntries[fe.id];
                                    files.push(fe.path);
                    
                                    if (flush) {
                                        model.flush();
                                    }
                                }
                    
                                remove(fileEntry, true);
                    
                                var utils = require('../utils');
                    
                                for (var i = 0; i < files.length; ++i) {
                                    files[i] = model.getProjectFolder() + files[i];
                                }
                                utils.removeFiles(files);
                    
                                ctrl.state.setState(ctrl.states.def);
                                return true;
                            },
                            id: guid.generateId(),
                        });

                        ctrl.eventPool.add({
                            priority: 0,
                            handle: function (e) {
                                if (e.type !== 'click') {
                                    return false;
                                }

                                if (e.button !== 0) {
                                    return false;
                                }
                    
                                var target = e.target;
                                var menuItem = target.getAttribute('project-context-menu');
                                if (menuItem !== 'Rename') {
                                    return false;
                                }
                    
                                var id = target.getAttribute('id');
                                id = parseInt(id);
                    
                                var model = require('./model');
                                var fileEntry = model.fileEntries[id];
                    
                                var elem = target;
                                while (!elem.getAttribute('file-entry')) {
                                    elem = elem.parentElement;
                                }
                                
                                ctrl.stateContext.renaming = { fileEntry: fileEntry };
                                ctrl.state.setState(ctrl.states.renaming);

                                return true;
                            },
                            id: guid.generateId(),
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
                                var menuItem = target.getAttribute('project-context-menu');
                                if (menuItem !== 'Import') {
                                    return false;
                                }

                                var electron = require('electron');
                                var remote = electron.remote;
                                var dialog = remote.dialog;

                                var path = dialog.showOpenDialog({
                                    properties: ['multiSelections']
                                });

                                for (var i = 0; i < path.length; ++i) {
                                    var curPath = path[i];
                                    var model = require('./model');
                                    if (!curPath.startsWith(model.getProjectPath())) {
                                        ctrl.state.setState(ctrl.states.def);
                                    }
                                    curPath = curPath.substring(model.getProjectFolder().length);
                                    var fileEntry = require('./fileEntry');
                                    fileEntry.create(curPath);
                                }
                                model.flush();

                                ctrl.state.setState(ctrl.states.def);
                            },
                            id: guid.generateId(),
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
                                var menuItem = target.getAttribute('project-context-menu');
                                if (!menuItem) {
                                    ctrl.state.setState(ctrl.states.def);
                                    return true;
                                }
                                return false;
                            },
                            id: guid.generateId(),
                        });
                    },
                    exitState: function () {
                        ctrl.render();
                    },
                },
                renaming: {
                    enterState() {
                        ctrl.eventPool.clear();

                        var fileEntry = ctrl.stateContext.renaming.fileEntry;

                        var init = require('../init');
                        var rootElement = init.parent;

                        var wnd = rootElement.querySelector('[subwindow="' + ctrl.subwindowId + '"]');
                        var elem = wnd.querySelector('[file-entry="' + fileEntry.id + '"]');

                        while (elem.firstChild) {
                            elem.removeChild(elem.firstChild);
                        }
            
                        var ejs = require('ejs');
                        var html = ejs.render(views[renameInput], { fileEntry: fileEntry });
            
                        elem.innerHTML = html;
                        var input = elem.querySelector('[rename-file-object]');
                        input.value = fileEntry.getName();
                        
                        ctrl.eventPool.add({
                            priority: 0,
                            handle: function(e) {
                                if (e.type !== 'keypress') {
                                    return false;
                                }
                                if (e.key !== 'Enter' || input.value === '') {
                                    return false;
                                }

                                var model = require('./model');
                                var dir = model.fileEntries[fileEntry.parent];

                                var fs = require('fs');
                                var newPath = dir.path + '\\' + input.value;
                
                                fs.exists(model.getProjectFolder() + newPath, function (res) {

                                    if (!res) {
                                        fs.rename(model.getProjectFolder() + fileEntry.path, model.getProjectFolder() + newPath, function (err) {
                                            if (!err) {
                                                fileEntry.path = newPath;
                
                                                repairPaths(fileEntry);
                
                                                model.flush();
                                            }
                                            ctrl.state.setState(ctrl.states.def);
                                        });
                                    } else {
                                        ctrl.state.setState(ctrl.states.def);
                                    }
                                });

                                return true;
                            },
                            id: guid.generateId(),
                        });
                    },
                    exitState() {
                        ctrl.render();
                    },
                },
                dragging: {
                    dropHandler: {
                        priority: -1000,
                        handle: function(e) {
                            if (e.type !== 'mouseup') {
                                return false;
                            }
                            var eventManager = require('../EventHandling/eventManager');
                            eventManager.raiseCustomEvent({ type: 'dropFileObject' });
                            ctrl.state.setState(ctrl.states.def);
                        },
                        id: guid.generateId(),
                    },
                    enterState: function() {
                        var eventManager = require('../EventHandling/eventManager');
                        eventManager.addGlobal(ctrl.states.dragging.dropHandler);
                        eventManager.raiseCustomEvent({ type: 'dragFileObject', fileObject: ctrl.stateContext.dragging.fileEntry });
                        ctrl.eventPool.add({
                            priority: 0,
                            handle: function(e) {
                                if (e.type !== 'mouseup') {
                                    return false;
                                }
                                var target = e.target;
                                if (!target.getAttribute('file-entry')) {
                                    return false;
                                }
                                var newParent = parseInt(target.getAttribute('file-entry'));
                                var model = require('./model');
                                newParent = model.fileEntries[newParent];
                                
                                function canLinkTo(fe, parent) {
                                    if (!fe.parent) {
                                        return false;
                                    }
                                    if (!parent.isFolder()) {
                                        return false;
                                    }
                                    var cur = parent;
                                    while (cur) {
                                        if (cur.id === fe.id) {
                                            return false;
                                        }
                                        cur = cur.parent;
                                    }
                                    return true;
                                }

                                function linkTo(fe, parent) {
                                    if (!canLinkTo(fe, parent)) {
                                        return;
                                    }
                                    var fs = require('fs');
                                    var name = fe.getName();
                                    var model = require('./model');

                                    fs.rename(fe.getAbsolutePath(), parent.getAbsolutePath() + '\\' + name, function(err) {

                                        if (err) {
                                            console.log(err);
                                            return;
                                        }

                                        var origParent = fe.getParent();
                                        var index;
                                        for (var i = 0; i < origParent.children.length; ++i) {
                                            if (origParent.children[i] === fe.id) {
                                                index = i;
                                                break;
                                            }
                                        }
                                        console.log(index);

                                        origParent.children.splice(index, 1);
                                        parent.children.push(fe.id);
                                        fe.parent = parent.id.toString();

                                        fe.path = parent.path + '\\' + name;

                                        repairPaths(fe);

                                        model.flush();
                                        ctrl.render();
                                    });
                                }

                                linkTo(ctrl.stateContext.dragging.fileEntry, newParent);
                                return true;
                            },
                            id: guid.generateId(),
                        });
                    },
                    exitState: function() {
                        var eventManager = require('../EventHandling/eventManager');
                        eventManager.removeGlobal(ctrl.states.dragging.dropHandler);
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

                function enterDefaultState() {        
                    var state = require('../State/state');
                    ctrl.state = state.create();
                    ctrl.state.setState(ctrl.states.def);
                    callback();
                }

                function cb() {
                    var fe = require('./fileEntry');
                    fe.init(function () {
                        var model = require('./model');
                        model.init(enterDefaultState);
                    })
                }

                if (!views) {
                    var utils = require('../utils');
                    utils.readFiles(viewsDir, viewsFiles, function (res) {
                        views = res;
                        cb();
                    });
                    return;
                }
                enterDefaultState();
            },
            expanded: {},
            render: function () {
                var init = require('../init');
                var rootElement = init.parent;

                var wnd = rootElement.querySelector('[subwindow="' + ctrl.subwindowId + '"]');

                var windowTypes = wnd.querySelectorAll('[window-type]');
                for (var i = 0; i < windowTypes.length; ++i) {
                    var cur = windowTypes[i];
                    cur.className = "positionable unselectable";
                    if (cur.getAttribute('window-type') === 'project') {
                        cur.className += ' selected';
                    }
                }

                wnd = wnd.querySelector('[subwindow-content]');

                while (wnd.firstChild) {
                    wnd.removeChild(wnd.firstChild);
                }

                var model = require('./model');
                var root = model.getProjectRoot();
                wnd.innerHTML = root.render(ctrl);
            },
            getFileEntryById: function (id) {
                var model = require('./model');
                return model.fileEntries[id];
            },
            isExpanded: function (fileEntryId) {
                return ctrl.expanded[fileEntryId];
            },
            disable: function() {
                ctrl.state.setState(ctrl.states.disabled);
            }
        };
        return ctrl;
    }
};

module.exports = controller;