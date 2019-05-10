var views = undefined;
var gmView = 'gmView.html';
var viewNames = [gmView];
var viewsDir = __dirname + '\\Views\\';

var gameObject = {
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
    attachEditorMethods: function(go) {
        go.render = function(controller) {
            var ejs = require('ejs');
            var res = ejs.render(views[gmView], { ctrl: controller, gm: go });
            return res;
        };
        go.renderSync = function(controller) {
            var ejs = require('ejs');
            var res = ejs.render(views[gmView], { ctrl: controller, gm: go });
            return res;
        };
        go.serializable = function () {
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
    },
    create: function () {
        var moment = require('moment');
        var gm = {
            id: moment.now(),
            name: 'GameObject',
            children: [],
            components: [],
        };
        gameObject.attachEditorMethods(gm);
        return gm;
    },
    deserialize: function(obj) {
        function process(go) {
            gameObject.attachEditorMethods(go);
            for (var i = 0; i < go.children.length; ++i) {
                process(go.children[i]);
            }
        }
        process(obj);
    }
};

module.exports = gameObject;