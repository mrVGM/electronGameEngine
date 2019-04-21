var views = undefined;
var gmView = 'gmView.html';
var viewNames = [gmView];
var viewsDir = __dirname + '\\Views\\';

var gameObject = {
    idCount: 0,
    create: function () {
        var gm = {
            id: gameObject.idCount++,
            name: 'Root gtredg',
            children: [],
            render: function(controller, callback) {
                if (!views) {
                    views = {};
                    var utils = require('../utils');
                    utils.readFiles(viewsDir, viewNames, function (res) {
                        views = res;
                        gm.render(controller, callback);
                    });
                    return;
                }
                var ejs = require('ejs');
                var res = ejs.render(views[gmView], { ctrl: controller, gm: gm });
                callback(res);
            },
            renderSync(controller) {
                var ejs = require('ejs');
                var res = ejs.render(views[gmView], { ctrl: controller, gm: gm });
                return res;
            }
        };
        return gm;
    }
};

module.exports = gameObject;