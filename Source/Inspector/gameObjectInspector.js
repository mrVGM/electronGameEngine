var viewsDir = __dirname + '\\Views\\';
var frameView = 'frame.html';
var componentView = 'component.html';
var viewsFilenames = [frameView, componentView];
var views = undefined;

var inspector = {
    init: function(callback) {
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
            addComponent: function (component) {
                insp.selected.components.push(component);
            },
            render: function (wnd) {
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
                });
            },
            renderComponent: function (componentIndex) {
                var paramsAPI = require('../API/params');
                var ejs = require('ejs');
                return ejs.render(views[componentView], { component: insp.selected.components[componentIndex], componentIndex: componentIndex, paramsAPI: paramsAPI });
            },
        };
        return insp;
    }
};

module.exports = inspector;