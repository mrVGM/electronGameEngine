var controller = {
    create: function () {
        var ctrl = {
            selected: undefined,
            currentInspector: undefined,
            render: function () {
                var init = require('../init');
                var rootElement = init.parent;

                var wnd = rootElement.querySelector('[subwindow="' + ctrl.subwindowId + '"]');

                var windowTypes = wnd.querySelectorAll('[window-type]');
                for (var i = 0; i < windowTypes.length; ++i) {
                    var cur = windowTypes[i];
                    cur.className = "positionable unselectable";
                    if (cur.getAttribute('window-type') === 'inspector') {
                        cur.className += ' selected';
                    }
                }

                wnd = wnd.querySelector('[subwindow-content]');

                while (wnd.firstChild) {
                    wnd.removeChild(wnd.firstChild);
                }

                if (!ctrl.currentInspector) {
                    var insp = require('./gameObjectInspector');
                    ctrl.currentInspector = insp.create(ctrl.selected);
                }
                ctrl.currentInspector.render(function (html) {
                    wnd.innerHTML = html;
                });
            },
        };
        return ctrl;
    }
};

module.exports = controller;