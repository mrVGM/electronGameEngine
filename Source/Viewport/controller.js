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
                function imageComponent(go) {
                    for (var i = 0; i < go.components.length; ++i) {
                        if (go.components[i].script === ctrl.settingsFileLoaded.component.instance.params.imageScript.value)
                            return { component: go.components[i].instance, gameObject: go };
                    }
                }

                function transformComponent(go) {
                    for (var i = 0; i < go.components.length; ++i) {
                        if (go.components[i].script === ctrl.settingsFileLoaded.component.instance.params.transformScript.value)
                            return go.components[i].instance;
                    }
                }

                function getImages(go) {
                    var res = [];
                    var imgComp = imageComponent(go);
                    if (imgComp) {
                        res.push(imgComp);
                    }
                    for (var i = 0; i < go.children.length; ++i) {
                        res = res.concat(getImages(go.children[i]));
                    }
                    return res;
                }

                function getWorldPos(go, p) {
                    function findParentTransform(go) {
                        if (!go) {
                            return;
                        }
                        var tr = transformComponent(go);
                        if (tr) {
                            return tr;
                        }
                        return findParentTransform(go.parent);
                    }

                    function transform(component, vector) {
                        var scale = { x: component.params.scaleX.value, y: component.params.scaleY.value };

                        var res = { x: component.params.x.value, y: component.params.y.value };
                        res = { x: res.x + vector.x, y: res.y + vector.y };
                        res = { x: res.x * scale.x, y: res.y * scale.y };

                        var rot = component.params.rotation.value;
                        rot = 2 * Math.PI * rot / 360.0;

                        var x = { x: Math.cos(-rot), y: Math.sin(-rot) };
                        var y = { x: -x.y, y: x.x };

                        x = { x: res.x * x.x, y: res.x * x.y };
                        y = { x: res.y * y.x, y: res.y * y.y };
                        res = { x: x.x + y.x, y: x.y + y.y }; 
                        return res;
                    }

                    var curGo = go;

                    var res = p;

                    while (curGo) {
                        var tr = findParentTransform(curGo);
                        if (tr) {
                            res = transform(tr, res);
                            curGo = curGo.parent;
                        } else {
                            return res;
                        }
                    }

                    return res;
                }

                var projectModel = require('../Project/model');

                var images = getImages(hierarchyModel.root);


                for (var i = 0; i < images.length; ++i) {
                    if (!ctrl.images[images[i].component.params.image.value]) {
                        var image = new Image();
                        var fe = projectModel.fileEntries[images[i].component.params.image.value];
                        if (!fe) {
                            return;
                        }

                        image.src = 'file://' + projectModel.getProjectFolder() + fe.path;
                        ctrl.images[fe.id] = image;
                    }
                }

                var wnd = ctrl.getHTMLWindow();
                var canvas = wnd.querySelector('canvas');
                var context = canvas.getContext('2d');
                context.clearRect(0, 0, canvas.width, canvas.height);

                function renderImage(instance, go) {
                    var image = ctrl.images[instance.params.image.value];
                    
                    var dl = getWorldPos(go, { x: -instance.params.width.value / 2.0, y: -instance.params.height.value / 2.0 });
                    var dr = getWorldPos(go, { x: instance.params.width.value / 2.0, y: -instance.params.height.value / 2.0 });
                    var ul = getWorldPos(go, { x: -instance.params.width.value / 2.0, y: instance.params.height.value / 2.0 });

                    var d = { x: dr.x - dl.x, y: dr.y - dl.y };
                    var u = { x: ul.x - dl.x, y: ul.y - dl.y };
                    var rot = Math.atan2(d.y, d.x);

                    var cos = u.x * d.x + u.y * d.y;
                    var sin = u.x * d.y - u.y * d.x;

                    if (Math.abs(sin) < 0.00001) {
                        return;
                    }

                    var hskew = cos / sin;

                    var w = Math.sqrt(d.x * d.x + d.y * d.y);

                    var perp = { x: -d.y, y: d.x };
                    var h = Math.abs(u.x * perp.x + u.y * perp.y) / Math.sqrt(perp.x * perp.x + perp.y * perp.y);

                    context.translate(dl.x, dl.y);
                    context.rotate(rot);

                    context.transform(1, 0, hskew, 1, 0, 0);
                    context.drawImage(image, 0, 0, w, h);
                    context.transform(1, 0, -hskew, 1, 0, 0);

                    context.rotate(-rot);
                    context.translate(-dl.x, -dl.y);
                }
                for (var i = 0; i < images.length; ++i) {
                    renderImage(images[i].component, images[i].gameObject);
                }
            }
        };
        return ctrl;
    }
};

module.exports = controller;