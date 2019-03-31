var controller = {
    idCount: 0,
    tree: {},
    viewMap: {},
    init: function() {
        var model = require('./model');
        this.tree.path = model.projectRoot;
        var fs = require('fs');
        if (fs.lstatSync(this.tree.path).isDirectory()) {
            this.tree.isDir = true;
            this.tree.expanded = false;
        }
        else {
            this.tree.isDir = false;
        }
        this.tree.id = this.idCount++;
        this.viewMap[this.tree.id] = this.tree;
    },
    expand: function(id, expanded) {
        var node = this.viewMap[id];
        var repeat = false;
        if (expanded !== undefined && expanded === node.expanded) {
            repeat = true;
        }

        node.expanded = !node.expanded;
        if (node.children) {
            var view = require('./view');
            view.api.refresh();
            return;
        }
        var fs = require('fs');
        fs.readdir(node.path, function(err, data) {
            node.children = [];
            for (var i = 0; i < data.length; ++i) {
                var p = node.path + '\\' + data[i];
                var child = {
                    path: p,
                    id: controller.idCount++
                };
                controller.viewMap[child.id] = child;
                if (fs.lstatSync(p).isDirectory()) {
                    child.isDir = true;
                    child.expanded = false;
                }
                else {
                    child.isDir = false;
                }
                child.parent = node;
                node.children.push(child);
            }
            var view = require('./view');
            view.api.refresh();

            if (repeat) {
                controller.expand(id);
            }
        });
    },
    createPrefab(data, path, callback) {
        var file = path + '\\' + data.name + '.prefab';
        var fs = require('fs');
        if (fs.existsSync(file)) {
            var index = 1;
            file = path + '\\' + data.name + index + '.prefab';
            while (fs.existsSync(file)) {
                ++index;
                file = path + '\\' + data.name + index + '.prefab';
            }
        }
        console.log(file);
        var maxId = require('../hierarchy/model').idCounter;

        var model = require('./model');
        model.createFile(file, JSON.stringify({maxID: maxId, tree: data}), callback);
    },
    rename: function(id, newName) {
        var node = controller.viewMap[id];
        var parent = node.parent;
        var path = parent.path + '\\' + newName;
        var fs = require('fs');
        var view = require('./view');
        if (fs.existsSync(path)) {
            view.api.refresh();
            return;
        }
        fs.rename(node.path, path, function(err) {
            var model = require('./model');
            var id = model.assetsMap.assets[node.path];
            delete model.assetsMap.assets[node.path];
            model.assetsMap.assets[path] = id;
            node.path = path;
            model.flushAssetsMap();
            view.api.refresh();
        });
    },
    createFolder: function(path, callback) {
        var model = require('./model');
        model.createFolder(path, callback);
    },
    createFile: function(path, callback) {
        var fs = require('fs');
        if (fs.existsSync(path)) {
            callback();
            return;
        }

        var model = require('./model');
        model.createFile(path, '', callback);
    }
};

module.exports = controller;