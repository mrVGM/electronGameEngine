var viewDir = __dirname + '\\Views\\';
var subwindowView = 'subwindow.html';
var viewNames = [subwindowView];
var views = undefined;

var subWindow = {
    idCount: 0,
    create: function () {
        var sw = {
            id: subWindow.idCount++,
            layout: undefined,
            children: [],
            parent: undefined,
            windowType: undefined,
            contentController: undefined,
            dim: {
                left: 0,
                top: 0,
                width: 1,
                height: 1
            },
            render: function (callback) {
                if (!views) {
                    var utils = require('../utils');
                    utils.readFiles(viewDir, viewNames, function (res) {
                        views = res;
                        sw.render(callback);
                    });
                    return;
                }
                var ejs = require('ejs');
                callback(ejs.render(views[subwindowView], { subwindow: sw }), function (elem) {
                    var sws = elem.querySelectorAll('[subwindow]');
                    var controller = require('./controller');
                    for (var i = 0; i < sws.length; ++i) {
                        var cur = sws[i];
                        var id = cur.getAttribute('subwindow');
                        id = parseInt(id);
                        var sw = controller.viewToModelMap[id];
                        if (sw.contentController) {
                            sw.contentController.render();
                        }
                    }
                });
            },
            renderSync: function () {
                if (!views) {
                    console.log("Error, no views loaded!!!");
                    return;
                }
                var ejs = require('ejs');
                return ejs.render(views[subwindowView], { subwindow: sw });
            },
            splitHorizontal: function () {
                if (!sw.layout || sw.layout !== 'horizontal') {
                    sw.layout = 'horizontal';
                    var left = subWindow.create();
                    var right = subWindow.create();

                    left.dim.width = 0.5;
                    right.dim.width = 0.5;
                    right.dim.left = 0.5;

                    left.parent = sw;
                    right.parent = sw;

                    left.windowType = sw.windowType;
                    left.contentController = sw.contentController;
                    if (left.contentController) {
                        left.contentController.subwindowId = left.id;
                    }

                    sw.windowType = undefined;
                    sw.contentController = undefined;

                    sw.children = [left, right];
                    return [left, right];
                }

                sw.dim.width /= 2.0;
                var right = subWindow.create();
                right.dim.width = sw.dim.width;
                right.dim.left = sw.dim.left + sw.dim.width;

                return [right];
            },
            splitVertical: function () {
                if (!sw.layout || sw.layout !== 'vertical') {
                    sw.layout = 'vertical';
                    var up = subWindow.create();
                    var down = subWindow.create();

                    up.dim.height = 0.5;
                    down.dim.height = 0.5;
                    down.dim.top = 0.5;

                    up.parent = sw;
                    down.parent = sw;

                    up.windowType = sw.windowType;
                    up.contentController = sw.contentController;
                    if (up.contentController) {
                        up.contentController.subwindowId = up.id;
                    }

                    sw.windowType = undefined;
                    sw.contentController = undefined;

                    sw.children = [up, down];
                    return [up, down];
                }

                sw.dim.height /= 2.0;
                var down = subWindow.create();
                down.dim.height = sw.dim.height;
                down.dim.top = sw.dim.top + sw.dim.height;

                return [down];
            }
        };
        return sw;
    }
}



module.exports = subWindow;