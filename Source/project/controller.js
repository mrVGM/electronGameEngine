var controller = {
    tree: {},
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
    }
};

module.exports = controller;