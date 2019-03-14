var imports = require('./imports');

module.exports = function(root) {
    imports.eventManager().init(root);
    imports.subWindows().init(root);
}