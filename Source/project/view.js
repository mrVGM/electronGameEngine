var viewTemplates = {};

var view = {
    rootElement: undefined,
    api: {
        refresh: function() {
            while (view.rootElement.firstChild) {
                view.rootElement.removeChild(view.rootElement.firstChild);
            }

            var ejs = require('ejs');
            var tree = require('./model').tree;
            var html = ejs.render(viewTemplates['main.ejs'], {tree: tree, api: this});
            view.rootElement.innerHTML = html;
        },
        visualizeFileEntry: function(fe) {
            console.log(fe);
            var ejs = require('ejs');
            return ejs.render(viewTemplates['fileEntry.ejs'], { fileEntry: fe, api: this });
        }
    },
    init: function(parent) {
        this.rootElement = parent;
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
            require('./model').getProjectDir();
        }

        loadViews();
    }
};

module.exports = view;