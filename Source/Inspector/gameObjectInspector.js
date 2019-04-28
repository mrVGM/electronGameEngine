var viewsDir = __dirname + '\\Views\\';
var frameView = 'frame.html';
var componentView = 'component.html';
var viewsFilenames = [frameView, componentView];
var views = undefined;

var inspector = {
    create: function (selected) {
        var insp = {
            selected: selected,
            init: function (callback) {
                if (!views) {
                    var utils = require('../utils');
                    utils.readFiles(viewsDir, viewsFilenames, function (res) {
                        views = res;
                        insp.init(callback);
                    });
                    return;
                }
                var params = require('../API/params');
                params.init(callback);
            },
            render: function (callback, controller) {
                function rend() {
                    var ejs = require('ejs');
                    var html = ejs.render(views[frameView], { insp: insp });
                    callback(html);
                }
                insp.init(rend);
            },
            renderComponent: function (component) {
                var paramsAPI = require('../API/params');
                var ejs = require('ejs');
                return ejs.render(views[componentView], { component: component, paramsAPI: paramsAPI });
            },
        };
        return insp;
    }
};

module.exports = inspector;