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

        var tr = require('./transform');
        for (var i = 0; i < points.length; ++i) {
            var cur = {
                weight: points[i].value.weight.value,
                point: searchGO(go, points[i].value.point.value),
            };
            if (points[i].value.leftHandle.value) {
                cur.leftHandle = searchGO(go, points[i].value.leftHandle.value);
            }
            if (points[i].value.rightHandle.value) {
                cur.rightHandle = searchGO(go, points[i].value.rightHandle.value);
            }
            cur.point = tr.getPosition(cur.point, { x: 0, y: 0 }, viewportSettings);
            if (cur.leftHandle) {
                cur.leftHandle = tr.getPosition(cur.leftHandle, { x: 0, y: 0 }, viewportSettings);
            }
            if (cur.rightHandle) {
                cur.rightHandle = tr.getPosition(cur.rightHandle, { x: 0, y: 0 }, viewportSettings);
            }
            points[i] = cur;
        }

        var projectModel = require('../../Project/model');
        var bezierScript = projectModel.fileEntries[viewportSettings.component.instance.params.bezierCurveScript.value];
        bezierScript = require(projectModel.getProjectFolder() + bezierScript.path);
        var bezCurveInstance = bezierScript.createInstance();

        var mathScript = projectModel.fileEntries[viewportSettings.component.instance.params.mathScript.value];
        var math = require(projectModel.getProjectFolder() + mathScript.path);

        bezCurveInstance.interface.getMath = function () {
            return math.math;
        };

        var minWeight = points[0].weight;
        var maxWeight = points[0].weight;
        for (var i = 0; i < points.length; ++i) {
            if (points[i].weight < minWeight) {
                minWeight = points[i].weight;
            }
            if (points[i].weight > maxWeight) {
                maxWeight = points[i].weight;
            }
        }

        for (var i = 1; i < 100; ++i) {
            var c = (i - 1) / 100;
            var p1W = (1 - c) * minWeight + c * maxWeight;
            c = i / 100;
            var p2W = (1 - c) * minWeight + c * maxWeight;

            var localPos = bezCurveInstance.interface.getEnclosingPointsAndLocalWeight(bezCurveInstance, points, p1W);
            var p1Pos = bezCurveInstance.interface.getPoint(bezCurveInstance, localPos.left, localPos.right, localPos.localWeight);

            localPos = bezCurveInstance.interface.getEnclosingPointsAndLocalWeight(bezCurveInstance, points, p2W);
            var p2Pos = bezCurveInstance.interface.getPoint(bezCurveInstance, localPos.left, localPos.right, localPos.localWeight);

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