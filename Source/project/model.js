var model = {
    projectRoot: undefined,
    getProjectDir: function() {
        if (!this.projectRoot) {
            var electron = require('electron');
            var remote = electron.remote;
            var dialog = remote.dialog;
            
            var path = dialog.showOpenDialog({
                properties: ['openDirectory']
            });

            this.projectRoot = path[0];

            this.tree.path = this.projectRoot;
            var fs = require('fs');
            var tree = this.tree;
            if (fs.lstatSync(this.tree.path).isDirectory()) {
                tree.isDir = true;
                tree.children = [];
                fs.readdir(this.tree.path, function(err, data) {
                    for (var i = 0; i < data.length; ++i) {
                        var p = tree.path + '\\' + data[i];
                        var isDir = fs.lstatSync(p).isDirectory();
                        var fe = {
                            path: p,
                            isDir: isDir,
                        };
                        if (isDir) {
                            fe.children = [];
                        }
                        tree.children.push(fe);
                    }
                    require('./view').api.refresh();
                });
            }
        }
        return this.projectRoot;
    },
    tree: {
        path: undefined,
    }
};

module.exports = model;