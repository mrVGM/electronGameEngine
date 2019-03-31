var viewTemplates = {};

var modalMode = false;
var modalSource = undefined;

var view = {
    rootElement: undefined,
    api: {
        clickEvent: function(e) {
            var target = e.target;

            if (target.getAttribute('contextmenuButton')) {
                if (target.getAttribute('contextmenuButton') === 'Close') {
                    view.api.refresh();
                    return;
                }
                if (target.getAttribute('contextmenuButton') === 'Rename') {
                    var renameObj = view.rootElement.querySelector('[renameFileObject]');
                    renameObj.style.left = '50%';
                    renameObj.style.top = '50%';
                    var input = renameObj.querySelector('input');

                    renameObj.addEventListener('keypress', function(e) {
                        if (e.key === 'Enter' && input.value !== '') {
                            var controller = require('./controller');
                            var id = modalSource.getAttribute('fileEntryId');
                            id = parseInt(id);
                            controller.rename(id, input.value);
                        }
                    });
                    return;
                }
                if (target.getAttribute('contextmenuButton') === 'CreateFolder') {
                    var controller = require('./controller');
                    var id = modalSource.getAttribute('fileEntryId');
                    id = parseInt(id);
                    var node = controller.viewMap[id];
                    
                    if (!node.isDir) {
                        view.api.refresh();
                        return;
                    }
                    var renameObj = view.rootElement.querySelector('[renameFileObject]');
                    renameObj.style.left = '50%';
                    renameObj.style.top = '50%';
                    var input = renameObj.querySelector('input');

                    renameObj.addEventListener('keypress', function(e) {
                        if (e.key === 'Enter' && input.value !== '') {
                            var controller = require('./controller');
                            var path = node.path + '\\' + input.value;
                            controller.createFolder(path, function() {
                                node.children = undefined;
                                controller.expand(node.id, node.expanded);
                                modalMode = false;
                            });
                        }
                    });
                    return;
                }

                if (target.getAttribute('contextmenuButton') === 'CreateFile') {
                    var controller = require('./controller');
                    var id = modalSource.getAttribute('fileEntryId');
                    id = parseInt(id);
                    var node = controller.viewMap[id];
                    
                    if (!node.isDir) {
                        view.api.refresh();
                        return;
                    }
                    var renameObj = view.rootElement.querySelector('[renameFileObject]');
                    renameObj.style.left = '50%';
                    renameObj.style.top = '50%';
                    var input = renameObj.querySelector('input');

                    renameObj.addEventListener('keypress', function(e) {
                        if (e.key === 'Enter' && input.value !== '') {
                            var controller = require('./controller');
                            var path = node.path + '\\' + input.value;
                            controller.createFile(path, function() {
                                node.children = undefined;
                                controller.expand(node.id, node.expanded);
                                modalMode = false;
                            });
                        }
                    });
                    return;
                }
            }

            if (target.getAttribute('directoryExpandButton')) {
                if (modalMode) {
                    return;
                }
                var id = target.getAttribute('directoryExpandButton');
                id = parseInt(id);
                var controller = require('./controller');
                controller.expand(id);
                return;
            }
        },
        contextMenu: function(e) {
            var target = e.target;
            if (target.getAttribute('fileEntryId')) {
                var id = target.getAttribute('fileEntryId');
                var coord = [e.offsetX, e.offsetY];
                var cur = target;
                while (cur.parentElement !== view.rootElement) {
                    coord[0] += cur.offsetLeft;
                    coord[1] += cur.offsetTop;
                    cur = cur.parentElement;
                }
                var contextMenu = view.rootElement.querySelector('[contextMenuProject]');
                
                contextMenu.style.left = coord[0] + 'px';
                contextMenu.style.top = coord[1] + 'px';
                modalMode = true;
                modalSource = target;
            }
        },
        refresh: function() {
            while (view.rootElement.firstChild) {
                view.rootElement.removeChild(view.rootElement.firstChild);
            }
            var ejs = require('ejs');
            var tree = require('./controller').tree;
            var html = ejs.render(viewTemplates['main.ejs'], {tree: tree, api: this});
            view.rootElement.innerHTML = html;
        },
        visualizeFileEntry: function(fe) {
            var ejs = require('ejs');
            return ejs.render(viewTemplates['fileEntry.ejs'], { fileEntry: fe, api: this });
        }
    },
    init: function(parent) {
        this.rootElement = parent;
        this.rootElement.addEventListener('click', this.api.clickEvent);
        this.rootElement.addEventListener('contextmenu', this.api.contextMenu);
        var viewFiles = ['main.ejs', 'fileEntry.ejs'];

        var fs = require('fs');

        var viewsTemplatesDir = __dirname + "/viewTemplates/";
        var index = 0;

        function loadViews() {
            if (index < viewFiles.length) {
                fs.readFile(viewsTemplatesDir + viewFiles[index], function(err, data) {
                    viewTemplates[viewFiles[index]] = data.toString();
                    index++;
                    loadViews();
                });
                return;
            }
            view.api.refresh();
        }

        loadViews();
    }
};

module.exports = view;