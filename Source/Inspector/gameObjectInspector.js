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
            render: function () {
                var ejs = require('ejs');
                var html = ejs.render(views[frameView], { insp: insp });
                return html;
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