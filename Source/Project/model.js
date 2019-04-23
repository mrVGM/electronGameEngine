var projectFolder = 'C:\\Users\\Vasil\\Desktop\\TestGame\\';
var fileMap = 'library.json';
var assetsFolder = 'Assets';

var model = {
    idCount: 0,
    fileEntries: undefined,
    root: undefined,
    init: function (callback) {
        var fs = require('fs');
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
                
                callback();
                model.flush();
            }
        });
    },
    flush: function () {
        var fs = require('fs');
        fs.writeFile(projectFolder + fileMap, JSON.stringify(model.fileEntries), function (err) { });
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
    }
};

module.exports = model;