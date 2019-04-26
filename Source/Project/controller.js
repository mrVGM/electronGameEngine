var views = undefined;
var contextMenuView = 'contextMenu.html';
var renameInput = 'renameView.html';
var viewsFiles = [contextMenuView, renameInput];
var viewsDir = __dirname + '\\Views\\';

var controller = {
    events: {
        registered: false,
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

                if (e.key !== 'Enter')
                    return;

                var target = e.target;

                var subwindow = target;
                while (!subwindow.getAttribute('subwindow')) {
                    subwindow = subwindow.parentElement;
                }

                var subwindowId = subwindow.getAttribute('subwindow');
                subwindowId = parseInt(subwindowId);

                var sws = require('../Layout/controller');
                var sw = sws.viewToModelMap[subwindowId];
                var contentController = sw.contentController;
                contentController.render();
            });

            return true;
        },
        clearContextMenuEvents: function () {
            var events = require('../events');
            var index = events.eventHandlers.mouseClick.indexOf(controller.events.rename);
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
            var clearContextMenu = function (e) {
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
                var index = events.eventHandlers.mouseClick.indexOf(clearContextMenu);
                events.eventHandlers.mouseClick.splice(index, 1);

                controller.events.clearContextMenuEvents();

                return true;
            }

            events.eventHandlers.mouseClick.push(controller.events.rename);

            events.eventHandlers.mouseClick.unshift(clearContextMenu);

            return true;
        },
        registerEvents: function () {
            if (controller.events.registered) {
                return;
            }
            controller.events.registered = true;
            var events = require('../events');
            events.eventHandlers.contextMenu.push(controller.events.onContextMenu);
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
                    });
                });
            }
        };
        return ctrl;
    }
};

module.exports = controller;