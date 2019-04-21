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

        var events = require('./events');
        this.parent.addEventListener('mousedown', events.handleEvent);
        this.parent.addEventListener('mouseup', events.handleEvent);
        this.parent.addEventListener('mousemove', events.handleEvent);
        this.parent.addEventListener('click', events.handleEvent);
    }
}

module.exports = exp;