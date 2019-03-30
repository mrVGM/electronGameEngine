var viewsTemplatesDir = __dirname + "/viewTemplates/";

var views = {};

module.exports = {
    root: undefined,
    modal: undefined,
    init: function(parent) {
        var fs = require('fs');
        var t = this;
        this.root = parent;
        
        var viewPaths = ['main.ejs', 'gameObject.ejs'];
        var index = 0;

        function loadViews() {
            fs.readFile(viewsTemplatesDir + viewPaths[index], function (err, data) {
                views[viewPaths[index]] = data.toString();
                ++index;
                if (index < viewPaths.length) {
                    loadViews();
                }
                else {
                    t.api.refresh();
                }
            });
        }
        loadViews();
    },
    api: {
        renderGO: function(go) {
            var ejs = require('ejs');
            var controller = require('./controller');
            return ejs.render(views['gameObject.ejs'], {go: go, controller: controller, api: this});
        },
        refresh: function() {
            var parent = module.exports.root;
            var t = this;

            while(parent.firstChild) {
                parent.removeChild(parent.firstChild);
            }

            var ejs = require('ejs');
            var model = require('./model');
            parent.innerHTML = ejs.render(views['main.ejs'], {model: model.selectedPrefab, api: this});

            var hierarchyRoot = document.querySelectorAll('[hierarchyRoot]')[0];
            var modalPlace = document.querySelectorAll('[modalPlace]')[0];

            var modalMode = false;

            hierarchyRoot.addEventListener('click', function(e) {
                if (modalMode) {
                    return;
                }

                var target = e.target;
                if (target.getAttribute('expandButton')) {
                    var controller = require('./controller');
                    var id = target.getAttribute('expandButton');
                    id = parseInt(id);
                    controller.toggleGameObject(id);
                    return;
                }
            });
            
            hierarchyRoot.addEventListener('mousedown', function(e) {
                var target = e.target;
                if (e.button !== 0) {
                    return;
                }
                if (target.getAttribute('gameobject')) {
                    var dragContext = require('../dragContext');
                    dragContext.ctx.type = 'gameObject';
                    var controller = require('./controller');
                    var id = target.getAttribute('gameobject');
                    id = parseInt(id);
                    dragContext.ctx.data = controller.getGO(id);
                }
            });

            hierarchyRoot.addEventListener('contextmenu', function(e) {
                if (modalMode) {
                    return;
                }

                var target = e.target;
                if (target.getAttribute('gameObject')) {
                    var cur = target;
                    var coord = [e.offsetX, e.offsetY];
                    while (cur !== module.exports.root) {
                        coord[0] += cur.offsetLeft;
                        coord[1] += cur.offsetTop;
                        cur = cur.parentElement;
                    }
                    var contextMenu = document.querySelectorAll('[contextMenu]')[0];
                    contextMenu.style.left = coord[0] + 'px';
                    contextMenu.style.top = coord[1] + 'px';
                    contextMenu.setAttribute('contextMenu', target.getAttribute('gameObject'));
                    modalMode = true;
                    return;
                }
            });

            modalPlace.addEventListener('click', function(e) {
                var target = e.target;
                if (target.getAttribute('contextMenuButton') === 'Close') {
                    t.refresh();
                    return;
                }
                if (target.getAttribute('contextMenuButton') === 'Rename') {
                    var controller = require('./controller');
                    var contextMenu = document.querySelectorAll('[contextMenu]')[0];
                    var renameForm = document.querySelectorAll('[renameGameObject]')[0];
                    var id = contextMenu.getAttribute('contextMenu');
                    id = parseInt(id);
                    contextMenu.style.left = '-100px';
                    renameForm.style.left = '50%';
                    renameForm.style.top = '50%';
                    var input = renameForm.children[0];
                    input.value = "GameObject";
                    input.addEventListener('keypress', function(e) {
                        if (e.key === 'Enter' && input.value !== '') {
                            controller.remane(id, input.value);
                        }
                    });
                    return;
                }
                if (target.getAttribute('contextMenuButton') === 'Create') {
                    var controller = require('./controller');
                    var contextMenu = document.querySelectorAll('[contextMenu]')[0];
                    var renameForm = document.querySelectorAll('[renameGameObject]')[0];
                    var id = contextMenu.getAttribute('contextMenu');
                    id = parseInt(id);
                    controller.create(id);
                    return;
                }
                if (target.getAttribute('contextMenuButton') === 'Delete') {
                    var controller = require('./controller');
                    var contextMenu = document.querySelectorAll('[contextMenu]')[0];
                    var renameForm = document.querySelectorAll('[renameGameObject]')[0];
                    var id = contextMenu.getAttribute('contextMenu');
                    id = parseInt(id);
                    controller.delete(id);
                    return;
                }
            });
        },
    }
}