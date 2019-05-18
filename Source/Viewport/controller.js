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
                                            ctrl.settingsFile = JSON.parse(data);
                                            console.log(ctrl.settingsFile);
                                            ctrl.render();
                                        });
                                        ctrl.settingsFile = settingsFile;
                                        console.log(settingsFile);
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
                    },
                    exitState: function () {
                        var eventManager = require('../EventHandling/eventManager');
                        eventManager.removeCustom(ctrl.states.def.dragFileObjectListener);
                        eventManager.removeCustom(ctrl.states.def.dropFileObjectListener);
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
            render: function () {
                var init = require('../init');
                var rootElement = init.parent;

                var wnd = rootElement.querySelector('[subwindow="' + ctrl.subwindowId + '"]');

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
                if (ctrl.settingsFile) {
                    template = views[settingsSelected];
                    settings = ctrl.settingsFile.component.instance;
                }

                var ejs = require('ejs');
                var html = ejs.render(template, { settings: settings });

                wnd.innerHTML = html;
            },
            disable: function () {
                ctrl.state.setState(ctrl.states.disabled);
            }
        };
        return ctrl;
    }
};

module.exports = controller;