var transform = {
    getComponent: function (go, viewportSettings) {
        var transformID = viewportSettings.component.instance.params.transformScript.value;
        for (var i = 0; i < go.components.length; ++i) {
            if (go.components[i].script === transformID) {
                return go.components[i].instance;
            }
        }
    },
    getPosition: function (go, p, viewportSettings) {
        function findParentTransform(go) {
            if (!go) {
                return;
            }
            var tr = transform.getComponent(go, viewportSettings);
            if (tr) {
                return tr;
            }
            return findParentTransform(go.parent);
        }

        function applyTransform(component, vector) {
            var scale = { x: component.params.scaleX.value, y: component.params.scaleY.value };

            var res = { x: component.params.x.value, y: component.params.y.value };
            res = { x: res.x + vector.x, y: res.y + vector.y };
            res = { x: res.x * scale.x, y: res.y * scale.y };

            var rot = component.params.rotation.value;
            rot = 2 * Math.PI * rot / 360.0;

            var x = { x: Math.cos(-rot), y: Math.sin(-rot) };
            var y = { x: -x.y, y: x.x };

            x = { x: res.x * x.x, y: res.x * x.y };
            y = { x: res.y * y.x, y: res.y * y.y };
            res = { x: x.x + y.x, y: x.y + y.y };
            return res;
        }

        var curGo = go;

        var res = p;

        while (curGo) {
            var tr = findParentTransform(curGo);
            if (tr) {
                res = applyTransform(tr, res);
                curGo = curGo.parent;
            } else {
                return res;
            }
        }

        return res;
        
    }
};

module.exports = transform;