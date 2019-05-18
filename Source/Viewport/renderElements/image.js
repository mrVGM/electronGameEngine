var image = {
    imagesCache: {},
    getComponent: function (go, viewportSettings) {
        for (var i = 0; i < go.components.length; ++i) {
            if (go.components[i].script === viewportSettings.component.instance.params.imageScript.value) {
                return go.components[i].instance;
            }
        }
    },
    render: function (go, viewportSettings, context) {
        var img = image.getComponent(go, viewportSettings);
        if (!img) {
            return;
        }

        var realImage = image.imagesCache[img.params.image.value];
        if (!realImage) {
            var projectModel = require('../../Project/model');

            var fe = projectModel.fileEntries[img.params.image.value];
            if (!fe) {
                return;
            }

            realImage = new Image();
            realImage.src = 'file://' + projectModel.getProjectFolder() + fe.path;

            image.imagesCache[img.params.image.value] = realImage;
        }

        var tr = require('./transform');

        var dl = tr.getPosition(go, { x: -img.params.width.value / 2.0, y: -img.params.height.value / 2.0 }, viewportSettings);
        var dr = tr.getPosition(go, { x: img.params.width.value / 2.0, y: -img.params.height.value / 2.0 }, viewportSettings);
        var ul = tr.getPosition(go, { x: -img.params.width.value / 2.0, y: img.params.height.value / 2.0 }, viewportSettings);

        var d = { x: dr.x - dl.x, y: dr.y - dl.y };
        var u = { x: ul.x - dl.x, y: ul.y - dl.y };
        var rot = Math.atan2(d.y, d.x);

        var cos = u.x * d.x + u.y * d.y;
        var sin = u.x * d.y - u.y * d.x;

        if (Math.abs(sin) < 0.00001) {
            return;
        }

        var hskew = cos / sin;

        var w = Math.sqrt(d.x * d.x + d.y * d.y);

        var perp = { x: -d.y, y: d.x };
        var h = Math.abs(u.x * perp.x + u.y * perp.y) / Math.sqrt(perp.x * perp.x + perp.y * perp.y);

        context.translate(dl.x, dl.y);
        context.rotate(rot);

        context.transform(1, 0, hskew, 1, 0, 0);
        context.drawImage(realImage, 0, 0, w, h);
        context.transform(1, 0, -hskew, 1, 0, 0);

        context.rotate(-rot);
        context.translate(-dl.x, -dl.y);
    },
    renderAll: function (root, viewportSettings, context) {
        function rend(go) {
            image.render(go, viewportSettings, context);
            for (var i = 0; i < go.children.length; ++i) {
                rend(go.children[i]);
            }
        }
        rend(root);
    }
};

module.exports = image;