var controller = {
    viewToModelMap: {},
    render: function (callback) {
        var model = require('./model');
        model.root.render(callback);
    },
    refresh: function () {
        var init = require('../init');
        init.refresh();
    },
    splitHorizontal: function (sw) {
        var newWindows = sw.splitHorizontal();
        for (var i = 0; i < newWindows.length; ++i) {
            var cur = newWindows[i];
            this.viewToModelMap[cur.id] = cur;
        }
        controller.refresh();
    },
    splitVerical: function (sw) {
        var newWindows = sw.splitVertical();
        for (var i = 0; i < newWindows.length; ++i) {
            var cur = newWindows[i];
            this.viewToModelMap[cur.id] = cur;
        }
        var init = require('../init');
        init.refresh();
    },
    init: function () {
        var model = require('./model');
        var subwindow = require('./subwindow');
        var sw = subwindow.create();
        this.viewToModelMap[sw.id] = sw;
        model.root = sw;

        var t = this;
        var events = require('../events');
        events.eventHandlers.mouseDown.push(function (e) {
            if (e.button !== 0) {
                return false;
            }
            var target = e.target;

            var subwindow = target.getAttribute('split-down-subwindow-button');
            if (subwindow) {
                subwindow = parseInt(subwindow);
                var sw = controller.viewToModelMap[subwindow];
                controller.splitVerical(sw);
                return true;
            }
            subwindow = target.getAttribute('split-right-subwindow-button');
            if (subwindow) {
                subwindow = parseInt(subwindow);
                var sw = controller.viewToModelMap[subwindow];
                controller.splitHorizontal(sw);
                return true;
            }
            return false;
        });

        events.eventHandlers.mouseDown.push(function (e) {
            if (e.button !== 0) {
                return false;
            }

            console.log(e);

            var target = e.target;

            var horizontalSeparator = target.getAttribute('horizontal-separator-between');
            if (horizontalSeparator) {
                var affected = horizontalSeparator.split(',');
                var up = parseInt(affected[0]);
                var down = parseInt(affected[1]);

                up = controller.viewToModelMap[up];
                down = controller.viewToModelMap[down];

                var parent = up.parent;

                var mouseUpHandler = function (evt) {
                    var el = evt.target;
                    var coord = [evt.offsetX, evt.offsetY];

                    while (true) {
                        var swId = el.getAttribute('subwindow');
                        if (swId && parseInt(swId) === parent.id) {
                            break;
                        }
                        coord[0] += el.offsetLeft;
                        coord[1] += el.offsetTop;
                        el = el.parentElement;
                    }

                    var xCoord = coord[0] / el.offsetWidth;
                    up.dim.width = xCoord - up.dim.left;
                    down.dim.width = down.dim.left + down.dim.width - xCoord;
                    down.dim.left = xCoord;

                    var index = events.eventHandlers.mouseUp.indexOf(mouseUpHandler);
                    events.eventHandlers.mouseUp.splice(index, 1);
                    controller.refresh();
                    return true;
                }

                events.eventHandlers.mouseUp.push(mouseUpHandler);
                return true;
            }

            var verticalSeparator = target.getAttribute('vertical-separator-between');
            if (verticalSeparator) {
                var affected = verticalSeparator.split(',');
                var up = parseInt(affected[0]);
                var down = parseInt(affected[1]);

                up = controller.viewToModelMap[up];
                down = controller.viewToModelMap[down];

                var parent = up.parent;

                var mouseUpHandler = function (evt) {
                    var el = evt.target;
                    var coord = [evt.offsetX, evt.offsetY];

                    while (true) {
                        var swId = el.getAttribute('subwindow');
                        if (swId && parseInt(swId) === parent.id) {
                            break;
                        }
                        coord[0] += el.offsetLeft;
                        coord[1] += el.offsetTop;
                        el = el.parentElement;
                    }

                    var yCoord = coord[1] / el.offsetHeight;
                    up.dim.height = yCoord - up.dim.top;
                    down.dim.height = down.dim.top + down.dim.height - yCoord;
                    down.dim.top = yCoord;

                    var index = events.eventHandlers.mouseUp.indexOf(mouseUpHandler);
                    events.eventHandlers.mouseUp.splice(index, 1);
                    controller.refresh();
                    return true;
                }

                events.eventHandlers.mouseUp.push(mouseUpHandler);
                return true;
            }
        });
    }
};

module.exports = controller;