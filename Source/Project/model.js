var projectFolder = undefined;
var fileMap = 'library.json';
var assetsFolder = 'Assets';

var model = {
    idCount: 0,
    fileEntries: undefined,
    root: undefined,
    init: function (callback) {
        var electron = require('electron');
        var remote = electron.remote;
        var dialog = remote.dialog;

        projectFolder = dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        projectFolder += '\\';

        var fs = require('fs');
        model.inited = true;
        fs.exists(projectFolder + fileMap, function (res) {
            if (res) {
                fs.readFile(projectFolder + fileMap, function (err, data) {
                    model.fileEntries = JSON.parse(data.toString());
                    var fileEntry = require('./fileEntry');
                    for (var i in model.fileEntries) {
                        if (model.idCount < i) {
                            model.idCount = i;
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
                fileEntry.create(assetsFolder);

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
                if (model.fileEntries[i].path === assetsFolder) {
                    model.root = model.fileEntries[i];
                    break;
                }
            }
        }
        return model.root;
    },
    getProjectPath: function () {
        return projectFolder + assetsFolder;
    },
    getAssetsFolder: function () {
        return assetsFolder;
    },
    getProjectFolder: function () {
        return projectFolder;
    }
};

module.exports = model;