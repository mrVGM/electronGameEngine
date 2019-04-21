var views = undefined;
var gmView = 'gmView.html';
var viewNames = [gmView];
var viewsDir = __dirname + '\\Views\\';

var gameObject = {
    idCount: 0,
    create: function () {
        var gm = {
            id: gameObject.idCount++,
            children: [],
            render: function(callback) {
                if (!views) {
                    views = {};
                    var utils = require('../utils');
                    utils.readFiles(viewsDir, viewNames, function (res) {
                        views = res;
                        gm.render(callback);
                    });
                    return;
                }
                var ejs = require('ejs');
                var res = ejs.render(views[gmView], { gm: gm });
                callback(res);
            }
        };
        return gm;
    }
};

module.exports = gameObject;