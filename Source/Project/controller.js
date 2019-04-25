var views = undefined;
var contextMenuView = 'contextMenu.html';
var viewsFiles = [contextMenuView];
var viewsDir = __dirname + '\\Views\\';

var controller = {
    events: {
        registered: false,
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
                return true;
            }

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