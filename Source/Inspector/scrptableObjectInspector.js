var viewsDir = __dirname + '\\Views\\';
var frameView = 'frameSO.html';
var componentView = 'component.html';
var viewsFilenames = [frameView, componentView];
var views = undefined;

var inspector = {
    init: function (callback) {
        if (!views) {
            var utils = require('../utils');
            utils.readFiles(viewsDir, viewsFilenames, function (res) {
                views = res;
                callback();
            });
            return;
        }
        callback();
    },
    create: function (selected) {
        var insp = {
            selected: selected,
            scriptableObject: undefined,
            flushScriptableObject: function () {
                var projectModel = require('../Project/model');
                var fs = require('fs');
                fs.writeFileSync(projectModel.getProjectFolder() + insp.selected.path, JSON.stringify(insp.scriptableObject));
            }, 
            addComponent: function (component) {
                insp.scriptableObject.component = component;
                var fs = require('fs');
                var projectModel = require('../Project/model');
                insp.flushScriptableObject();
            },
            getComponent: function () {
                return insp.scriptableObject.component;
            },
            flushChanges: function () {
                insp.flushScriptableObject();
            },
            render: function (wnd) {

                function createHTML() {
                    var ejs = require('ejs');
                    var html = ejs.render(views[frameView], { insp: insp });
                    wnd.innerHTML = html;

                    var inspectorWindow = wnd.querySelector('[inspector-window]');
                    if (!inspectorWindow) {
                        return;
                    }

                    inspectorWindow.addEventListener('change', function (e) {
                        var target = e.target;
                        if (!target.getAttribute('component-param-path')) {
                            return;
                        }
                        var params = require('../API/params');
                        params.syncValue(target);
                        insp.flushScriptableObject();
                    });
                }

                var projectModel = require('../Project/model');

                var fe = insp.selected;
                var fs = require('fs');
                fs.readFile(projectModel.getProjectFolder() + fe.path, function (err, data) {
                    data = data.toString();
                    var so = {};
                    if (!data || data === '') {
                        data = JSON.stringify(so);
                        fs.writeFile(projectModel.getProjectPath() + fe.path, data, function () {
                            insp.scriptableObject = so;
                            createHTML();
                        });
                    } else {
                        so = JSON.parse(data);
                        insp.scriptableObject = so;
                        if (so.component) {
                            var utils = require('../utils');
                            utils.updateComponentInstance(so.component);
                            insp.flushScriptableObject();
                        }
                        createHTML();
                    }
                });
            },
            renderComponent: function () {
                var paramsAPI = require('../API/params');
                var ejs = require('ejs');
                return ejs.render(views[componentView], { component: insp.scriptableObject.component, componentIndex: 0, paramsAPI: paramsAPI });
            },
        };
        return insp;
    }
};

module.exports = inspector;