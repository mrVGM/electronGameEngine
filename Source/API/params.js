var viewsDir = __dirname + '\\Views\\';
var numberView = 'number.html';
var textView = 'text.html';
var arrayView = 'array.html';
var customView = 'custom.html';
var viewsFiles = [numberView, textView, arrayView, customView];
var views = undefined;

var params = {
    init: function (callback) {
        if (!views) {
            var utils = require('../utils');
            utils.readFiles(viewsDir, viewsFiles, function (res) {
                views = res;
                params.init(callback);
            });
            return;
        }
        callback();
    },
    render: function (param, settings) {
        if (param.type === 'number') {
            return params.renderNumber(param, settings);
        }
        if (param.type === 'text') {
            return params.renderText(param, settings);
        }
        if (param.type === 'array') {
            return params.renderArray(param, settings);
        }
        if (param.type === 'custom') {
            return params.renderCustom(param, settings);
        }
        return 'Unknown parameter';
    },
    renderCustom: function (param, settings) {
        var ejs = require('ejs');
        var html = ejs.render(views[customView], { param: param, settings: { paramPath: settings.paramPath, paramsAPI: params } });
        return html;
    },
    renderNumber: function (param, settings) {
        var ejs = require('ejs');
        var html = ejs.render(views[numberView], { param: param, settings: settings });
        return html;
    },
    renderText: function (param, settings) {
        var ejs = require('ejs');
        var html = ejs.render(views[textView], { param: param, settings: settings });
        return html;
    },
    renderArray: function (param, settings) {
        var ejs = require('ejs');
        var html = ejs.render(views[arrayView], { param: param, settings: { paramPath: settings.paramPath, paramsAPI: params }} );
        return html;
    },
    setParamValue: function (elem, param) {
        if (param.type === 'number') {
            var val = parseFloat(elem.value);
            param.value = val;
            return;
        }
        if (param.type === 'text') {
            param.value = elem.value;
            return;
        }
        if (param.type === 'array') {
            if (elem.getAttribute('array-length')) {
                var len = parseInt(elem.value);
                if (param.value.length > len) {
                    param.value = param.value.slice(0, len);
                    return;
                }
                while (param.value.length < len) {
                    function copyParam(p) {
                        if (p.type !== 'custom') {
                            return {
                                name: p.name,
                                type: p.type,
                                value: p.value
                            };
                        }

                        var res = {
                            name: p.name,
                            type: p.type,
                            value: {}
                        };
                        for (var subParam in p.value) {
                            res.value[subParam] = copyParam(p.value[subParam]);
                        }
                        return res;
                    }

                    var newElem = copyParam(param.defaultElement);
                    newElem.name = 'Element ' + param.value.length;
                    param.value.push(newElem);
                }
                return;
            }
            if (elem.getAttribute('array-index')) {
                var arrayIndex = elem.getAttribute('array-index');
                arrayIndex = parseInt(arrayIndex);
                params.setParamValue(elem, param.value[arrayIndex]);
                return;
            }
        }
    },
    syncValue: function (elem) {
        var utils = require('../utils');
        var sw = utils.findSubWindow(elem);
        var contentController = sw.contentController;

        var selected = contentController.currentInspector.selected;
        var componentIndex = elem;
        while (!componentIndex.getAttribute('component-index')) {
            componentIndex = componentIndex.parentElement;
        }
        componentIndex = componentIndex.getAttribute('component-index');
        componentIndex = parseInt(componentIndex);

        var paramPath = elem.getAttribute('component-param-path');
        paramPath = paramPath.split('.');

        var param = selected.components[componentIndex].instance.params[paramPath[0]];
        for (var i = 1; i < paramPath.length; ++i) {
            param = param.value;
            var p = paramPath[i];
            p = parseInt(p);
            if (isNaN(p)) {
                p = paramPath[i];
            }
            param = param[p];
        }

        params.setParamValue(elem, param);

        var utils = require('../utils');
        var sw = utils.findSubWindow(elem);
        sw.contentController.render();
    }
};

module.exports = params;