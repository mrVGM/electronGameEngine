var controller = {
    create: function () {
        var ctrl = {
            viewToGameObjectsMap: {},
            subwindowId: undefined,
            createGameObject: function () {
                var gameObject = require('./gameObject');
                var gm = gameObject.create();
                ctrl.viewToGameObjectsMap[gm.id] = gm;
                return gm;
            },
            init: function () {
                var model = require('./model');
                if (!model.root) {
                    var rootObject = ctrl.createGameObject();
                    model.root = rootObject;
                }
            },
            render: function () {
                var init = require('../init');
                var rootElement = init.parent;

                var wnd = rootElement.querySelector('[subwindow="' + ctrl.subwindowId + '"]');

                wnd = wnd.querySelector('[subwindow-content]');

                while (wnd.firstChild) {
                    wnd.removeChild(wnd.firstChild);
                }

                var model = require('./model');

                model.root.render(function (html) {
                    wnd.innerHTML = html;
                });
            }
        };
        ctrl.init();
        return ctrl;
    }
};

module.exports = controller;