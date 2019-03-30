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
    expand: function(id) {
        var node = this.viewMap[id];
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
                node.children.push(child);
            }
            var view = require('./view');
            view.api.refresh();
        });
    }
};

module.exports = controller;