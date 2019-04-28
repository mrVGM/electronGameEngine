var views = undefined;
var contextMenuView = 'contextMenu.html';
var renameInput = 'renameView.html';
var viewsFiles = [contextMenuView, renameInput];
var viewsDir = __dirname + '\\Views\\';

var controller = {
    events: {
        registered: false,
        cancelContextMenu: undefined,
        rename: function (e) {
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

            while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
            }

            var ejs = require('ejs');
            var html = ejs.render(views[renameInput], { fileEntry: fileEntry });

            elem.innerHTML = html;

            controller.events.clearContextMenuEvents();

            var input = elem.querySelector('[rename-file-object]');
            input.value = fileEntry.getName();
            input.addEventListener('keypress', function (e) {

                if (e.key !== 'Enter' || input.value === '')
                    return;

                var target = e.target;

                var id = target.getAttribute('rename-file-object');
                id = parseInt(id);

                var model = require('./model');
                var fe = model.fileEntries[id];

                var utils = require('../utils');
                var sw = utils.findSubWindow(target);
                var contentController = sw.contentController;

                var dir = model.fileEntries[fe.parent];

                var fs = require('fs');
                var newPath = dir.path + '\\' + input.value;

                fs.exists(newPath, function (res) { 
                    if (!res) {
                        fs.rename(fe.path, newPath, function (err) {
                            if (!err) {
                                fe.path = newPath;

                                function repairPaths(fileEntry) {
                                    fileEntry.path = model.fileEntries[fileEntry.parent].path + '\\' + fileEntry.getName();
                                    if (!fileEntry.children) {
                                        return;
                                    }
                                    for (var i = 0; i < fileEntry.children.length; ++i) {
                                        repairPaths(model.fileEntries[fileEntry.children[i]]);
                                    }
                                }

                                repairPaths(fe);

                                model.flush();
                            }
                            contentController.render();
                        });
                    } else {
                        contentController.render();
                    }
                });
            });

            return true;
        },
        create: function (e) {
            if (e.button !== 0) {
                return false;
            }

            var target = e.target;
            var menuItem = target.getAttribute('project-context-menu');
            if (menuItem !== 'Create') {
                return false;
            }

            controller.events.clearContextMenuEvents();

            var id = target.getAttribute('id');
            id = parseInt(id);

            var model = require('./model');
            var fileEntry = model.fileEntries[id];

            if (!fileEntry.isFolder()) {
                var el = target;
                while (!el.getAttribute('context-menu-place')) {
                    el = el.parentElement;
                }
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
                return true;
            }

            var fs = require('fs');
            var newPath = fileEntry.path + '\\NewFile';
            if (fs.existsSync(newPath)) {
                var index = 0;

                while (fs.existsSync(newPath + index)) {
                    ++index;
                }
                newPath += index;
            }

            fs.writeFile(newPath, '', function () {
                var fe = require('./fileEntry');
                fe.create(newPath);
                model.flush();

                var elem = target;
                while (!elem.getAttribute('subwindow')) {
                    elem = elem.parentElement;
                }
                var swId = elem.getAttribute('subwindow');
                swId = parseInt(swId);
                var swcontroller = require('../Layout/controller');
                var sw = swcontroller.viewToModelMap[swId];
                sw.contentController.render();
            });

            return true;
        },
        createFolder: function (e) {
            if (e.button !== 0) {
                return false;
            }

            var target = e.target;
            var menuItem = target.getAttribute('project-context-menu');
            if (menuItem !== 'CreateFolder') {
                return false;
            }

            controller.events.clearContextMenuEvents();

            var id = target.getAttribute('id');
            id = parseInt(id);

            var model = require('./model');
            var fileEntry = model.fileEntries[id];

            if (!fileEntry.isFolder()) {
                var el = target;
                while (!el.getAttribute('context-menu-place')) {
                    el = el.parentElement;
                }
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
                return true;
            }

            var fs = require('fs');
            var newPath = fileEntry.path + '\\NewFolder';
            if (fs.existsSync(newPath)) {
                var index = 0;

                while (fs.existsSync(newPath + index)) {
                    ++index;
                }
                newPath += index;
            }

            fs.mkdir(newPath, function () {
                var fe = require('./fileEntry');
                fe.create(newPath);
                model.flush();

                var elem = target;
                while (!elem.getAttribute('subwindow')) {
                    elem = elem.parentElement;
                }
                var swId = elem.getAttribute('subwindow');
                swId = parseInt(swId);
                var swcontroller = require('../Layout/controller');
                var sw = swcontroller.viewToModelMap[swId];
                sw.contentController.render();
            });

            return true;
        },
        delete: function (e) {
            if (e.button !== 0) {
                return false;
            }

            var target = e.target;
            var menuItem = target.getAttribute('project-context-menu');
            if (menuItem !== 'Delete') {
                return false;
            }

            console.log('delete', e);

            controller.events.clearContextMenuEvents();

            var id = target.getAttribute('id');
            id = parseInt(id);

            var model = require('./model');
            var fileEntry = model.fileEntries[id];

            if (model.getProjectPath() === fileEntry.path) {
                var el = target;
                while (!el.getAttribute('context-menu-place')) {
                    el = el.parentElement;
                }
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
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

            utils.removeFiles(files);

            var sw = utils.findSubWindow(target);

            sw.contentController.render();
            return true;
        },
        clearContextMenuEvents: function () {
            var events = require('../events');
            var index = events.eventHandlers.mouseClick.indexOf(controller.events.cancelContextMenu);
            events.eventHandlers.mouseClick.splice(index, 1);
            controller.events.cancelContextMenu = undefined;

            index = events.eventHandlers.mouseClick.indexOf(controller.events.rename);
            events.eventHandlers.mouseClick.splice(index, 1);
            index = events.eventHandlers.mouseClick.indexOf(controller.events.create);
            events.eventHandlers.mouseClick.splice(index, 1);
            index = events.eventHandlers.mouseClick.indexOf(controller.events.createFolder);
            events.eventHandlers.mouseClick.splice(index, 1);
            index = events.eventHandlers.mouseClick.indexOf(controller.events.delete);
            events.eventHandlers.mouseClick.splice(index, 1);
        },
        onContextMenu: function (e) {
            var target = e.target;
            var fileEntry = target.getAttribute('file-entry');
            if (!fileEntry)
                return false;

            fileEntry = parseInt(fileEntry);

            var model = require('./model');
            fileEntry = model.fileEntries[fileEntry];

            var ejs = require('ejs');
            var html = ejs.render(views[contextMenuView], { fileEntry: fileEntry });

            var contextPlace = target.querySelector('[context-menu-place]');
            contextPlace.innerHTML = html;
            contextPlace.style.left = e.offsetX + 'px';
            contextPlace.style.top = e.offsetY + 'px';

            var events = require('../events');
            controller.events.cancelContextMenu = function (e) {
                console.log(e);
                if (e.button !== 0) {
                    return false;
                }

                var target = e.target;
                if (target.getAttribute('project-context-menu')) {
                    return false;
                }
                while (contextPlace.firstChild) {
                    contextPlace.removeChild(contextPlace.firstChild);
                }

                controller.events.clearContextMenuEvents();

                return true;
            }

            events.eventHandlers.mouseClick.push(controller.events.rename);
            events.eventHandlers.mouseClick.push(controller.events.create);
            events.eventHandlers.mouseClick.push(controller.events.createFolder);
            events.eventHandlers.mouseClick.push(controller.events.delete);

            events.eventHandlers.mouseClick.unshift(controller.events.cancelContextMenu);

            return true;
        },
        expandFolder: function (e) {
            if (e.button !== 0) {
                return false;
            }
            var target = e.target;
            var id = target.getAttribute('file-entry-expand-button');
            if (!id) {
                return false;
            }

            id = parseInt(id);

            var sw = target;
            while (!sw.getAttribute('subwindow')) {
                sw = sw.parentElement;
            }
            sw = sw.getAttribute('subwindow');
            sw = parseInt(sw);
            var sws = require('../Layout/controller');
            sw = sws.viewToModelMap[sw];

            var expanded = sw.contentController.expanded[id];
            sw.contentController.expanded[id] = !expanded;
            sw.contentController.render();
        },
        dragToComponent: function (e) {
            if (e.button !== 0) {
                return false;
            }
            var target = e.target;
            var fileId = target.getAttribute('file-entry');
            if (!fileId) {
                return false;
            }

            fileId = parseInt(fileId);

            var events = require('../events');

            var drop = function (e) {
                var index = events.eventHandlers.mouseUp.indexOf(drop);
                events.eventHandlers.mouseUp.splice(index, 1);

                var target = e.target;
                if (!target.getAttribute('add-script-place')) {
                    return true;
                }

                var utils = require('../utils');
                var sw = utils.findSubWindow(target);
                var contentController = sw.contentController;

                var model = require('./model');
                var fileEntry = model.fileEntries[fileId];
                var script = require(fileEntry.path);

                var paramsAPI = require('../API/params');

                contentController.currentInspector.selected.components.push({ script: fileId, instance: script.createInstance(), paramsAPI: paramsAPI });
                contentController.render();
                return true;
            }
            
            events.eventHandlers.mouseUp.unshift(drop);

            return true;
        },
        registerEvents: function () {
            if (controller.events.registered) {
                return;
            }
            controller.events.registered = true;
            var events = require('../events');
            events.eventHandlers.contextMenu.push(controller.events.onContextMenu);
            events.eventHandlers.mouseClick.push(controller.events.expandFolder);
            events.eventHandlers.mouseDown.push(controller.events.dragToComponent);
        }
    },
    create: function () {
        if (!views) {
            var utils = require('../utils');
            utils.readFiles(viewsDir, viewsFiles, function (res) {
                views = res;
            });
        }

        controller.events.registerEvents();

        var ctrl = {
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
                model.init(function () {
                    var root = model.getProjectRoot();
                    root.render(function (html) {
                        wnd.innerHTML = html;
                    }, ctrl);
                });
            },
            getFileEntryById: function (id) {
                var model = require('./model');
                return model.fileEntries[id];
            },
            isExpanded: function (fileEntryId) {
                return ctrl.expanded[fileEntryId];
            }
        };
        return ctrl;
    }
};

module.exports = controller;