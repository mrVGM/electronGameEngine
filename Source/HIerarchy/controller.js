var views = undefined;
var viewDir = __dirname + '\\Views\\';
var contextMenuView = 'contextMenu.html';
var renameView = 'renameView.html';
var viewFilenames = [contextMenuView, renameView];

var controller = {
    events: {
        setup: false,
        contextMenuPlace: undefined,
        closeCM: function () {
            if (!controller.events.contextMenuPlace) {
                return;
            }

            while (controller.events.contextMenuPlace.firstChild) {
                controller.events.contextMenuPlace.removeChild(controller.events.contextMenuPlace.firstChild);
            }
            controller.events.contextMenuPlace.style.left = '0%';
            controller.events.contextMenuPlace.style.top = '0%';
            controller.events.contextMenuPlace = undefined;

            var eventHandlers = require('../events');
            var index = eventHandlers.eventHandlers.mouseClick.indexOf(controller.events.closeContextMenu);
            if (index >= 0) {
                eventHandlers.eventHandlers.mouseClick.splice(index, 1);
            }
            controller.events.closeContextMenu = undefined;
        },
        closeContextMenu: undefined,
        contextMenu: function (e) {
            var target = e.target;
            var gme = target.getAttribute('game-object-entry');
            if (!gme) {
                return false;
            }
            if (!views) {
                return false;
            }

            controller.events.closeCM();

            var ejs = require('ejs');

            var contextMenuPlace = target.querySelector('[context-menu-place]');
            controller.events.contextMenuPlace = contextMenuPlace;
            while (contextMenuPlace.firstChild) {
                contextMenuPlace.removeChild(contextMenuPlace.firstChild);
            }

            console.log(contextMenuPlace);

            var goId = parseInt(gme);

            var go = controller.viewToGameObjectsMap[goId];

            contextMenuPlace.innerHTML = ejs.render(views[contextMenuView], { gm: go });

            contextMenuPlace.style.left = e.offsetX + 'px';
            contextMenuPlace.style.top = e.offsetY + 'px';

            var eventHandlers = require('../events');
            if (!controller.events.closeContextMenu) {
                controller.events.closeContextMenu = function (e) {
                    var target = e.target;
                    if (!target.getAttribute('hierarchy-context-menu')) {
                        controller.events.closeCM();
                        return true;
                    }
                    return false;
                };
            }
            eventHandlers.eventHandlers.mouseClick.unshift(controller.events.closeContextMenu)
        },
        create: function (e) {
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
                controller.events.closeCM();
                controller.refresh();
                return true;
            }
            return false;
        },
        expand: function (e) {
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
        },
        delete: function (e) {
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
                controller.events.closeCM();
                controller.refresh();
                return true;
            }
            return false;
        },
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
                return true;
            }

            events.eventHandlers.mouseUp.unshift(drop);

            return true;
        },
        rename: function (e) {
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
                var go = controller.viewToGameObjectsMap[id];

                while (!target.getAttribute('game-object-entry')) {
                    target = target.parentElement;
                }

                while (target.firstChild) {
                    target.removeChild(target.firstChild);
                }

                var ejs = require('ejs');
                target.innerHTML = ejs.render(views[renameView], { go: go });

                var renameInput = target.querySelector('[rename-game-object]');
                renameInput.value = go.name;
                renameInput.addEventListener('keypress', function (e) {
                    if (e.key === 'Enter' && renameInput.value !== '') {
                        go.name = renameInput.value;
                        controller.refresh();
                    }
                });

                return true;
            }
            return false;
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
            }
        }
    },
    create: function () {
        var utils = require('../utils');
        utils.readFiles(viewDir, viewFilenames, function (res) {
            views = res;
        });

        var ctrl = {
            subwindowId: undefined,
            expandedMap: {},
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
            init: function () {
                var model = require('./model');
                if (!model.root) {
                    var rootObject = ctrl.createGameObject();
                    model.root = rootObject;
                }
                if (controller.events.setup) {
                    return;
                }

                var eventHandlers = require('../events');
                eventHandlers.eventHandlers.contextMenu.push(controller.events.contextMenu);
                eventHandlers.eventHandlers.mouseClick.push(controller.events.create);
                eventHandlers.eventHandlers.mouseClick.push(controller.events.expand);
                eventHandlers.eventHandlers.mouseClick.push(controller.events.delete);
                eventHandlers.eventHandlers.mouseClick.push(controller.events.rename);
                eventHandlers.eventHandlers.mouseDown.push(controller.events.drag);
                controller.events.setup = true;
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

                model.root.render(ctrl, function (html) {
                    wnd.innerHTML = html;
                });
            },
            getRoot: function () {
                var model = require('./model');
                return model.root;
            }
        };
        ctrl.init();
        return ctrl;
    }
};

module.exports = controller;