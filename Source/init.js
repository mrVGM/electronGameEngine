var exp = {
    parent: undefined,
    refresh: function () {
        while (this.parent.firstChild) {
            this.parent.removeChild(this.parent.firstChild);
        }

        var controller = require('./Layout/controller');
        controller.render(function (html, ready) {
            exp.parent.innerHTML = html;
            ready(exp.parent);
        });
    },
    init: function (par) {
        document.GUIAPI = {
            onElementLoad: function (e) {
                console.log("bgtb");
            }
        };

        this.parent = par;

        var controller = require('./Layout/controller');
        controller.init();
        this.refresh();

        var eventManager = require('./EventHandling/eventManager');
        this.parent.addEventListener('mousedown', eventManager.handle);
        this.parent.addEventListener('mouseup', eventManager.handle);
        this.parent.addEventListener('mousemove', eventManager.handle);
        this.parent.addEventListener('click', eventManager.handle);
        this.parent.addEventListener('contextmenu', eventManager.handle);
        this.parent.addEventListener('keypress', eventManager.handle);
    }
}

module.exports = exp;