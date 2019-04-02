var viewTemplates = {};

var view = {
    rootElement: undefined,
    init: function(parent) {
        this.rootElement = parent;
        var files = ['main.ejs', 'script.ejs'];
        var index = 0;
        var fs = require('fs');
        var templatesFolder = __dirname + '\\viewTemplates\\';
        function load() {
            if (index === files.length) {
                view.api.refresh();
                return;
            }
            fs.readFile(templatesFolder + files[index], function(err, data) {
                viewTemplates[files[index]] = data.toString();
                index++;
                load();
            });
        }
        load();
    },
    api: {
        refresh: function() {
            while(view.rootElement.firstChild) {
                view.rootElement.removeChild(view.rootElement.firstChild);
            }
            var ejs = require('ejs');
            var selectedEntity = require('../common').selectedEntity;
            var html = ejs.render(viewTemplates['main.ejs'], {api: view.api, selectedEntity: selectedEntity});
            view.rootElement.innerHTML = html;
        },
        visualizeComponents: function() {
            var ejs = require('ejs');
            return ejs.render(viewTemplates['script.ejs']);
        }
    },
};

module.exports = view;