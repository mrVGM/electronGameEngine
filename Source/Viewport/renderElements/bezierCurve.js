var bezier = {
    getComponent: function (go, viewportSettings) {
        for (var i = 0; i < go.components.length; ++i) {
            if (go.components[i].script === viewportSettings.component.instance.params.bezierCurveScript.value) {
                return go.components[i].instance;
            }
        }
    },
    render: function (go, viewportSettings, context) {
        function searchGO(root, id) {
            if (root.id === id) {
                return root;
            }
            for (var i = 0; i < root.children.length; ++i) {
                var res = searchGO(root.children[i], id);
                if (res) {
                    return res;
                }
            }
        }

        var bez = bezier.getComponent(go, viewportSettings);
        if (!bez) {
            return;
        }
        var points = [];
        points = points.concat(bez.params.controlPoints.value);
        for (var i = 0; i < points.length - 1; ++i) {
            for (var j = i + 1; j < points.length; ++j) {
                if (points[i].value.weight.value > points[j].value.weight.value) {
                    var tmp = points[i];
                    points[i] = points[j];
                    points[j] = tmp;
                }
            }
        }
        
        var total = points[points.length - 1].value.weight.value - points[0].value.weight.value;
        for (var i = 1; i < 100; ++i) {
            var p1W = (i - 1) * total / 100.0;
            var p2W = i * total / 100.0;

            var p1L = 0;
            while (points[p1L].value.weight.value > p1W)
                p1L++;

            var p2L = p1L;
            while (points[p2L].value.weight.value > p2W)
                p2L++;

            var p1Pos = (p1W - points[p1L].value.weight.value) / (points[p1L + 1].value.weight.value - points[p1L].value.weight.value);
            var p2Pos = (p2W - points[p2L].value.weight.value) / (points[p2L + 1].value.weight.value - points[p2L].value.weight.value);

            var tr = require('./transform');

            var leftGO = searchGO(go, points[p1L].value.point.value);
            var rightGO = searchGO(go, points[p1L + 1].value.point.value);
            
            
            var leftPoint = tr.getPosition(searchGO(go, points[p1L].value.point.value), { x: 0, y: 0 }, viewportSettings);
            var rightPoint = tr.getPosition(searchGO(go, points[p1L + 1].value.point.value), { x: 0, y: 0 }, viewportSettings);


            p1Pos = { x: (1 - p1Pos) * leftPoint.x + p1Pos * rightPoint.x, y: (1 - p1Pos) * leftPoint.y + p1Pos * rightPoint.y };

            leftPoint = tr.getPosition(searchGO(go, points[p2L].value.point.value), { x: 0, y: 0 }, viewportSettings);
            rightPoint = tr.getPosition(searchGO(go, points[p2L + 1].value.point.value), { x: 0, y: 0 }, viewportSettings);

            p2Pos = { x: (1 - p2Pos) * leftPoint.x + p2Pos * rightPoint.x, y: (1 - p2Pos) * leftPoint.y + p2Pos * rightPoint.y };

            context.beginPath();
            context.moveTo(p1Pos.x, p1Pos.y);
            context.lineTo(p2Pos.x, p2Pos.y);
            context.stroke();
        }
    },
    renderAll: function (root, viewportSettings, context) {
        function rend(go) {
            bezier.render(go, viewportSettings, context);
            for (var i = 0; i < go.children.length; ++i) {
                rend(go.children[i]);
            }
        }
        rend(root);
    }
};

module.exports = bezier;