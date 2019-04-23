var viewFolder = __dirname + '\\Views\\';
var fileView = 'fileView.html';
var viewFiles = [fileView];
var views = undefined;

var fileEntry = {
    create: function (path) {
        var model = require('./model');

        var fe = fileEntry.deserialize({ path: path, id: model.idCount++ });

        model.fileEntries[fe.id] = fe;
        return fe;
    },
    deserialize: function (serialized) {
        var fe = {
            path: serialized.path,
            id: serialized.id,
            render: function (callback) {
                if (!views) {
                    var utils = require('../utils');
                    utils.readFiles(viewFolder, viewFiles, function (res) {
                        views = res;
                        fe.render(callback);
                    });
                    return;
                }

                var ejs = require('ejs');
                callback(ejs.render(views[fileView], { fileEntry: fe }));
            },
            renderSync: function () {
                var ejs = require('ejs');
                return ejs.render(views[fileView], { fileEntry: fe });
            }
        };
        return fe;
    }
};

module.exports = fileEntry;