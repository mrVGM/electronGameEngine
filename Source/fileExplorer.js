var fs = require('fs');
var pathlib = require('path');

function showFile(path) {
    if (fs.lstatSync(path).isDirectory()) {
        return showFolder(path);
    }
    return showSimpleFile(path);
}

function showSimpleFile(path) {
    var file = document.createElement('div');
    file.innerText = pathlib.basename(path);
    return file;
}

function showFolder(path, expanded) {
    var folder = document.createElement('div');
    var icon = document.createElement('div');
    icon.setAttribute('class', 'arrow-icon');

    icon.addEventListener('mousedown', function() {
        if (folder.ctx.subfiles) {
            icon.setAttribute('class', 'arrow-icon');
        } else {
            icon.setAttribute('class', 'arrow-icon-rotated');
        }
        folder.ctx.expand();
    });

    var name = document.createElement('div');
    name.style.position = 'relative';
    name.style.height = '20px';
    name.appendChild(icon);

    var text = document.createElement('div');
    text.innerHTML = pathlib.basename(path);
    text.style.position = 'absolute';
    text.style.left = '15px';
    text.style.top = '0px';

    name.appendChild(text);

    folder.appendChild(name);

    folder.ctx = {
        element: folder,
        subfiles: undefined,
        expand: function() {
            if (!this.subfiles) {
                this.subfiles = document.createElement('div');
                
                this.subfiles.style.position = 'relative';
                this.subfiles.style.left = '20px';

                this.element.appendChild(this.subfiles);

                var subfiles = this.subfiles;

                fs.readdir(path, function(err, dir) {
                    for (var i = 0; i < dir.length; ++i) {
                        var file = showFile(path + '\\' + dir[i]);
                        subfiles.appendChild(file);
                    }
                });
            }
            else {
                this.element.removeChild(this.subfiles);
                this.subfiles = undefined;
            }
        }
    };

    return folder;
}

module.exports = {
    fileExplorerContext: {
        currentPath: undefined,
        content: undefined,
        path: undefined,
        hierarchy: undefined,
        folders: [],
        visualizeContents: function() {
            if (!this.hierarchy) {
                this.hierarchy = document.createElement('div');
                this.content.appendChild(this.hierarchy);
            }
            while (this.hierarchy.firstChild) {
                this.hierarchy.removeChild(this.hierarchy.firstChild);
            }

            this.hierarchy.appendChild(showFile(this.currentPath));
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
            this.visualizeContents();
        }
    },

    init: function(parent, pathName) {
        this.fileExplorerContext.currentPath = pathName;
        this.fileExplorerContext.content = parent;
        this.fileExplorerContext.visualizePath();
    }
};