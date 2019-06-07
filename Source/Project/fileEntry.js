var viewFolder = __dirname + '\\Views\\';
var fileView = 'fileView.html';
var viewFiles = [fileView];
var views = undefined;

var fileEntry = {
    init: function(callback) {
        if (!views) {
            var utils = require('../utils');
            utils.readFiles(viewFolder, viewFiles, function (res) {
                views = res;
                callback();
            });
            return;
        }
        callback();
    },
    create: function (path) {
        var model = require('./model');

        var id = model.getId(path);
        if (id) {
            return model.fileEntries[id];
        }

        var assetsFolder = model.getAssetsFolder();
        if (!path.startsWith(assetsFolder))
            return;

        var prot = {
            path: path,
            id: model.idCount++,
            parent: undefined,
            children: undefined
        };

        var fs = require('fs');
        if (fs.lstatSync(model.getProjectFolder() + path).isDirectory()) {
            prot.children = [];
        }

        if (path === assetsFolder) {
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

        path = path.split('\\');

        var index = 1;
        var curPath = assetsFolder;
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
            getParent: function() {
                if (!fe.parent) {
                    return undefined;
                }
                var parentId = parseInt(fe.parent);
                var model = require('./model');
                return model.fileEntries[parentId];
            },
            getAbsolutePath: function() {
                var model = require('./model');
                return model.getProjectFolder() + fe.path;
            },
            isFolder: function () {
                var model = require('./model');
                var fs = require('fs');
                return fs.lstatSync(model.getProjectFolder() + fe.path).isDirectory();
            },
            render: function (controller) {
                var ejs = require('ejs');
                return ejs.render(views[fileView], { fileEntry: fe, ctrl: controller });
            },
            renderSync: function (controller) {
                var ejs = require('ejs');
                return ejs.render(views[fileView], { fileEntry: fe, ctrl: controller });
            },
            getChildrenSorted: function(ctrl) {
                function compare(fe1, fe2) {
                    var fe1Folder = ctrl.getFileEntryById(fe1).isFolder();
                    var fe2Folder = ctrl.getFileEntryById(fe2).isFolder();

                    if (fe1Folder && !fe2Folder) {
                        return -1;
                    }
                    if (fe2Folder && !fe1Folder) {
                        return 1;
                    }
                    return 0;
                }
                var res = [].concat(fe.children);
                for (var i = 0; i < res.length - 1; ++i) {
                    for (var j = i + 1; j < res.length; ++j) {
                        if (compare(res[i], res[j]) > 0) {
                            var tmp = res[i];
                            res[i] = res[j];
                            res[j] = tmp;
                        }
                    }
                }
                return res;
            }
        };
        return fe;
    }
};

module.exports = fileEntry;