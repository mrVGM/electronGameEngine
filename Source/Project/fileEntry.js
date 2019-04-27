var viewFolder = __dirname + '\\Views\\';
var fileView = 'fileView.html';
var viewFiles = [fileView];
var views = undefined;

var fileEntry = {
    create: function (path) {
        var model = require('./model');

        var id = model.getId(path);
        if (id) {
            return model.fileEntries[id];
        }

        var projectPath = model.getProjectPath();
        if (!path.startsWith(model.getProjectPath()))
            return;

        var prot = {
            path: path,
            id: model.idCount++,
            parent: undefined,
            children: undefined
        };

        var fs = require('fs');
        if (fs.lstatSync(path).isDirectory()) {
            prot.children = [];
        }

        if (path === projectPath) {
            var fe = fileEntry.deserialize(prot);
            model.fileEntries[fe.id] = fe;
            return fe;
        }

        var name = path.split('\\');
        name = name[name.length - 1];
        var parentFolder = path.substring(0, path.length - name.length - 1);
        var parentFolderId = model.getId(parentFolder);
        if (parentFolderId) {
            var parentFolderFE = model.fileEntries[parentFolderId];
            prot.parent = parentFolderId;
            var fe = fileEntry.deserialize(prot);
            parentFolderFE.children.push(fe.id);
            model.fileEntries[fe.id] = fe;
            return fe;
        }

        path = path.substring(projectPath.length + 1);
        path = path.split('\\');

        var index = 0;
        var curPath = projectPath;
        var newFile = undefined;
        while (index < path.length) {
            var dir = model.getId(curPath);
            dir = model.fileEntries[dir];
            curPath += '\\' + path[index++];
            newFile = fileEntry.create(curPath);
        }

        return newFile;
    },
    deserialize: function (serialized) {
        var fe = {
            path: serialized.path,
            id: serialized.id,
            parent: serialized.parent,
            children: serialized.children,
            getName: function () {
                var p = fe.path.split('\\');
                return p[p.length - 1];
            },
            isFolder: function () {
                var fs = require('fs');
                return fs.lstatSync(fe.path).isDirectory();
            },
            render: function (callback, controller) {
                if (!views) {
                    var utils = require('../utils');
                    utils.readFiles(viewFolder, viewFiles, function (res) {
                        views = res;
                        fe.render(callback, controller);
                    });
                    return;
                }

                var ejs = require('ejs');
                callback(ejs.render(views[fileView], { fileEntry: fe, ctrl: controller }));
            },
            renderSync: function (controller) {
                var ejs = require('ejs');
                return ejs.render(views[fileView], { fileEntry: fe, ctrl: controller });
            },
        };
        return fe;
    }
};

module.exports = fileEntry;