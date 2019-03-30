var viewTemplates = {};

var view = {
    rootElement: undefined,
    api: {
        clickEventListener: function(e) {
            var target = e.target;
            if (target.getAttribute('directoryExpandButton')) {
                var id = target.getAttribute('directoryExpandButton');
                id = parseInt(id);
                var controller = require('./controller');
                controller.expand(id);
                return;
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
        this.rootElement.addEventListener('click', this.api.clickEventListener);
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