
var controller = {
    create: function () {
        var ctrl = {
            render: function () {
                var init = require('../init');
                var rootElement = init.parent;

                var wnd = rootElement.querySelector('[subwindow="' + ctrl.subwindowId + '"]');

                var windowTypes = wnd.querySelectorAll('[window-type]');
                for (var i = 0; i < windowTypes.length; ++i) {
                    var cur = windowTypes[i];
                    cur.className = "positionable unselectable";
                    if (cur.getAttribute('window-type') === 'project') {
                        cur.className += ' selected';
                    }
                }

                wnd = wnd.querySelector('[subwindow-content]');

                while (wnd.firstChild) {
                    wnd.removeChild(wnd.firstChild);
                }

                console.log('Init Model ferg');

                var model = require('./model');
                model.init(function () {
                    var root = model.getProjectRoot();
                    root.render(function (html) {
                        wnd.innerHTML = html;
                    });
                });
            }
        };
        return ctrl;
    },
    init: function () {
        var model = require('./model');
        model.init(function () { });
    }
};

module.exports = controller;