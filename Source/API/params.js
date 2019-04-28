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
    render: function (param) {
        if (param.type === 'number') {
            return params.renderNumber(param);
        }
        if (param.type === 'text') {
            return params.renderText(param);
        }
        if (param.type === 'array') {
            return params.renderArray(param);
        }
        return 'Unknown parameter';
    },
    renderNumber: function (param) {
        var ejs = require('ejs');
        var html = ejs.render(views[numberView], { param: param });
        return html;
    },
    renderText: function (param) {
        var ejs = require('ejs');
        var html = ejs.render(views[textView], { param: param });
        return html;
    },
    renderArray: function (param) {
        var ejs = require('ejs');
        var html = ejs.render(views[arrayView], { param: param });
        return html;
    }
};

module.exports = params;