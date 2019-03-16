var fs = require('fs');

module.exports = {
    fileExplorerContext: {
        currentPath: undefined,
        content: undefined,
        path: undefined,
        folders: [],
        visualizeContents: function() {
            if (currentPath) {
                fs.readdir(pathName, function(err, dir) {
                    for(var i = 0, l = dir.length; i < l; i++) {
                        var filePath = dir[i];
                        var file = document.createElement('div');
                        file.innerText = filePath;
                        parent.appendChild(file);
                    }
                });
            }
        },
        visualizePath: function() {
            if (!this.path) {
                this.path = document.createElement('div');
                this.content.appendChild(this.path);
            }

            while (this.path.firstChild) {
                this.path.removeChild(this.path.firstChild);
            }

            this.folders = this.currentPath.split('\\');
            var p = '';
            for (var i = 0; i < this.folders.length; ++i) {
                var fld = document.createElement('span');
                fld.innerText = this.folders[i];
                var arrow = document.createElement('span');
                arrow.innerText = ' > ';
                this.path.appendChild(fld);
                if (i < this.folders.length - 1) {
                    this.path.appendChild(arrow);
                }
                p += this.folders[i];
                fld.ctx = {
                    path: p,
                    fileExplorer: this
                };
                p += '\\';
                fld.addEventListener('mousedown', function(e) {
                    e.srcElement.ctx.fileExplorer.currentPath = e.srcElement.ctx.path;
                    e.srcElement.ctx.fileExplorer.visualizePath();
                });
            }
        }
    },

    init: function(parent, pathName) {
        this.fileExplorerContext.currentPath = pathName;
        this.fileExplorerContext.content = parent;
        this.fileExplorerContext.visualizePath();
    }
};