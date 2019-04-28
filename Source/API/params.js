var viewsDir = __dirname + '\\Views\\';
var numberView = 'number.html';
var textView = 'text.html';
var arrayView = 'array.html';
var viewsFiles = [numberView, textView, arrayView];
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
    render: function (param, paramID) {
        if (param.type === 'number') {
            return params.renderNumber(param, paramID);
        }
        if (param.type === 'text') {
            return params.renderText(param, paramID);
        }
        if (param.type === 'array') {
            return params.renderArray(param, paramID);
        }
        return 'Unknown parameter';
    },
    renderNumber: function (param, paramID) {
        var ejs = require('ejs');
        var html = ejs.render(views[numberView], { param: param, paramPath: paramID });
        return html;
    },
    renderText: function (param, paramID) {
        var ejs = require('ejs');
        var html = ejs.render(views[textView], { param: param, paramPath: paramID });
        return html;
    },
    renderArray: function (param, paramID) {
        var ejs = require('ejs');
        var html = ejs.render(views[arrayView], { param: param, paramPath: paramID });
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
                    param.value.push(param.elementGenerator());
                }
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

        params.setParamValue(elem, selected.components[componentIndex].instance.params[paramPath]);

        console.log(selected);
    }
};

module.exports = params;