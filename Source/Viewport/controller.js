var views = undefined;
var noSettingsSelected = 'noSettingsSelected.html';
var settingsSelected = 'settingsSelected.html';
var viewsFiles = [noSettingsSelected, settingsSelected];
var viewsDir = __dirname + '\\Views\\';

var controller = {
    create: function () {
        var guid = require('../EventHandling/guidGen');
        var ctrl = {
            state: undefined,
            eventPool: undefined,
            settingsFile: undefined,
            settingsFileLoaded: undefined,
            images: {},
            states: {
                def: {
                    dropFileObject: undefined,
                    dragFileObjectListener: {
                        priority: 0,
                        handle: function (evt) {
                            if (evt.type !== 'dragFileObject') {
                                return false;
                            }
                            var settingsFile = evt.fileObject;
                            ctrl.states.def.dropFileObject = {
                                priority: 0,
                                handle: function (e) {
                                    if (e.type !== 'mouseup') {
                                        return false;
                                    }

                                    var target = e.target;

                                    if (!target.getAttribute('viewport-settings')) {
                                        return false;
                                    }

                                    if (target.getAttribute('viewport-settings')) {
                                        var fs = require('fs');
                                        var projectModel = require('../Project/model');

                                        fs.readFile(projectModel.getProjectFolder() + settingsFile.path, function (err, data) {
                                            data = data.toString();
                                            ctrl.settingsFileLoaded = JSON.parse(data);
                                            ctrl.render();
                                        });
                                        ctrl.settingsFile = settingsFile;
                                    }
                                    return true;
                                },
                                id: guid.generateId(),
                            };
                            ctrl.eventPool.add(ctrl.states.def.dropFileObject);
                            return true;
                        },
                        id: guid.generateId(),
                    },
                    dropFileObjectListener: {
                        priority: 0,
                        handle: function (e) {
                            if (e.type !== 'dropFileObject') {
                                return false;
                            }
                            ctrl.eventPool.remove(ctrl.states.def.dropFileObject);
                            ctrl.states.def.dropFileObject = undefined;
                            return true;
                        },
                        id: guid.generateId(),
                    },
                    enterState: function () {
                        var eventManager = require('../EventHandling/eventManager');
                        ctrl.eventPool.clear();
                        eventManager.addCustom(ctrl.states.def.dragFileObjectListener);
                        eventManager.addCustom(ctrl.states.def.dropFileObjectListener);

                        function renderViewport() {
                            ctrl.renderViewport();
                            setTimeout(renderViewport);
                        }
                        ctrl.stopRenderingViewport = false;
                        renderViewport();
                    },
                    exitState: function () {
                        var eventManager = require('../EventHandling/eventManager');
                        eventManager.removeCustom(ctrl.states.def.dragFileObjectListener);
                        eventManager.removeCustom(ctrl.states.def.dropFileObjectListener);
                        ctrl.stopRenderingViewport = true;
                    },
                },
                disabled: {
                    enterState: function () {
                        ctrl.eventPool.clear();
                    },
                    exitState: function () { },
                }
            },
            init: function (callback) {
                var eventPool = require('../EventHandling/eventPool');
                ctrl.eventPool = eventPool.create();
                var state = require('../State/state');
                ctrl.state = state.create();
                ctrl.state.setState(ctrl.states.def);

                if (views) {
                    callback();
                    return;
                }

                var utils = require('../utils');
                utils.readFiles(viewsDir, viewsFiles, function (res) {
                    views = res;
                    callback();
                });
            },
            getHTMLWindow: function () {
                var init = require('../init');
                var rootElement = init.parent;

                var wnd = rootElement.querySelector('[subwindow="' + ctrl.subwindowId + '"]');
                return wnd;
            },
            render: function () {
                var wnd = ctrl.getHTMLWindow();

                var windowTypes = wnd.querySelectorAll('[window-type]');
                for (var i = 0; i < windowTypes.length; ++i) {
                    var cur = windowTypes[i];
                    cur.className = "positionable unselectable";
                    if (cur.getAttribute('window-type') === 'viewport') {
                        cur.className += ' selected';
                    }
                }

                wnd = wnd.querySelector('[subwindow-content]');

                while (wnd.firstChild) {
                    wnd.removeChild(wnd.firstChild);
                }

                var template = views[noSettingsSelected];
                var settings = undefined;
                if (ctrl.settingsFileLoaded) {
                    template = views[settingsSelected];
                    settings = ctrl.settingsFileLoaded.component.instance;
                }

                var ejs = require('ejs');
                var html = ejs.render(template, { settings: settings });

                wnd.innerHTML = html;
            },
            disable: function () {
                ctrl.state.setState(ctrl.states.disabled);
            },
            stopRenderingViewport: false,
            renderViewport: function () {
                if (!ctrl.settingsFileLoaded) {
                    return;
                }
                var hierarchyModel = require('../HIerarchy/model');
                if (!hierarchyModel.root) {
                    return;
                }
                
                var wnd = ctrl.getHTMLWindow();
                var canvas = wnd.querySelector('canvas');
                var context = canvas.getContext('2d');

                var imageRenderer = require('../Viewport/renderElements/image');
                var bezierRenderer = require('../Viewport/renderElements/bezierCurve');
                context.clearRect(0, 0, canvas.width, canvas.height);
                imageRenderer.renderAll(hierarchyModel.root, ctrl.settingsFileLoaded, context);
                bezierRenderer.renderAll(hierarchyModel.root, ctrl.settingsFileLoaded, context);
            }
        };
        return ctrl;
    }
};

module.exports = controller;