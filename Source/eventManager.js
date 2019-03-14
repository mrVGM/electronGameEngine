var imports = require('./imports');
var utils = import.utils();

var eventManager = {
    root: undefined,
    init: function(root) {
        this.root = root;
    },
    mousedown: [],
    mousemove: [],
    mouseup: [],
    getArr: function(type) {
        var arr = undefined;
        if (type === 'mousedown') {
            arr = this.mousedown;
        }
        else if (type === 'mousemove') {
            arr = this.mousemove;
        }
        else if (type === 'mouseup') {
            arr = this.mouseup;
        }
        return arr;
    },
    setArr: function(type, arr) {
        if (type === 'mousedown') {
            this.mousedown = arr;
        }
        else if (type === 'mousemove') {
            this.mousemove = arr;
        }
        else if (type === 'mouseup') {
            this.mouseup = arr;
        }
    },
    executeHandlers(type, e) {
        var arr = this.getArr(type);

        var t = this;
        function isIn(e, element) {
            var topLeft = utils.getCoordinatesIn(0, 0, element, t.root);
            var bottomRight = utils.getCoordinatesIn(element.offsetWidth, element.offsetHeight, element, t.root);

            var pos = utils.getCoordinatesIn(offsetX, offsetY, e.srcElement, t.root);

            if (pos[0] <= topLeft[0] || pos[0] >= bottomRight[0]) {
                return false;
            }
            if (pos[1] <= topLeft[1] || pos[1] >= bottomRight[1]) {
                return false;
            }

            return true;
        }

        for (var i = 0; i < arr.length; ++i) {
            if (isIn(e, arr[i].element)) {
                arr[i].handler(e);
            }
        }
    },
    addHandler: function(type, element, handler) {
        var arr = this.getArr(type);
        arr.push({
            element: element,
            handler: handler
        });
    },
    removeHandler: function(type, element) {
        arr = this.getArr(type);
        var tmp = [];
        for (var i = 0; i < arr.length; ++i) {
            if (arr[i].element !== element) {
                tmp.push(arr[i]);
            }
        }
        this.setArr(type, tmp);
    }
}

module.exports = eventManager