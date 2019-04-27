var projectFolder = 'C:\\Users\\Vasil\\Desktop\\TestGame\\';
var fileMap = 'library.json';
var assetsFolder = 'Assets';

var model = {
    idCount: 0,
    fileEntries: undefined,
    root: undefined,
    inited: false,
    init: function (callback) {
        if (model.inited) {
            callback();
            return;
        }
        var fs = require('fs');
        model.inited = true;
        fs.exists(projectFolder + fileMap, function (res) {
            if (res) {
                fs.readFile(projectFolder + fileMap, function (err, data) {
                    model.fileEntries = JSON.parse(data.toString());
                    var fileEntry = require('./fileEntry');
                    for (var i in model.fileEntries) {
                        if (model.fileEntries.idCount < i) {
                            model.fileEntries.idCount = i;
                        }
                        model.fileEntries[i] = fileEntry.deserialize(model.fileEntries[i]);
                    }
                    ++model.idCount;
                    callback();
                });
            }
            else {
                model.fileEntries = {};
                var fileEntry = require('./fileEntry');
                fileEntry.create(projectFolder + assetsFolder);

                console.log(model);

                callback();
                model.flush();
            }
        });
    },
    flush: function () {
        var fs = require('fs');
        fs.writeFile(projectFolder + fileMap, JSON.stringify(model.fileEntries), function (err) { });
    },
    getId: function (path) {
        for (var i in model.fileEntries) {
            if (model.fileEntries[i].path === path) {
                return i;
            }
        }
        return undefined;
    },
    getProjectRoot: function () {
        if (!model.root) {
            for (var i in model.fileEntries) {
                if (model.fileEntries[i].path === projectFolder + assetsFolder) {
                    model.root = model.fileEntries[i];
                    break;
                }
            }
        }
        return model.root;
    },
    getProjectPath: function () {
        return projectFolder + assetsFolder;
    }
};

module.exports = model;