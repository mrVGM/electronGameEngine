var viewsDir = __dirname + '\\Views\\';
var frameView = 'frame.html';
var componentView = 'component.html';
var viewsFilenames = [frameView, componentView];
var views = undefined;

var inspector = {
    create: function (selected) {
        var insp = {
            selected: selected,
            render: function (callback, controller) {
                if (!views) {
                    var utils = require('../utils');
                    utils.readFiles(viewsDir, viewsFilenames, function (res) {
                        views = res;
                        insp.render(callback, controller);
                    });
                    return;
                }
                var ejs = require('ejs');
                var html = ejs.render(views[frameView], {});
                callback(html);
            }
        };
        return insp;
    }
};

module.exports = inspector;