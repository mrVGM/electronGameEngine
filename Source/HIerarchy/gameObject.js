var views = undefined;
var gmView = 'gmView.html';
var viewNames = [gmView];
var viewsDir = __dirname + '\\Views\\';

var gameObject = {
    idCount: 0,
    init: function(callback) {
        if (views) {
            callback();
            return;
        }
        var utils = require('../utils');
        utils.readFiles(viewsDir, viewNames, function(res) {
            views = res;
            callback();
        });
    },
    create: function () {
        var gm = {
            id: gameObject.idCount++,
            name: 'GameObject',
            parent: undefined,
            children: [],
            components: [],
            render: function(controller) {
                var ejs = require('ejs');
                var res = ejs.render(views[gmView], { ctrl: controller, gm: gm });
                return res;
            },
            renderSync(controller) {
                var ejs = require('ejs');
                var res = ejs.render(views[gmView], { ctrl: controller, gm: gm });
                return res;
            },
            serializable: function () {
                function serialize(go) {
                    var res = {
                        id: go.id,
                        name: go.name,
                        children: [],
                        components: go.components,
                    };
                    for (var i = 0; i < go.children.length; ++i) {
                        res.children.push(serialize(go.children[i]));
                    }
                    return res;
                }
                return serialize(gm);
            }
        };
        return gm;
    }
};

module.exports = gameObject;