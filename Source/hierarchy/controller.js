module.exports = {
    modelsMap: {},
    toggle: function(go) {
        var view = require('./view');
        if (!this.modelsMap[go.id].expanded) {
            view.api.expand(go);
            this.modelsMap[go.id].expanded = true;
        } else {
            view.api.collapse(go);
            this.modelsMap[go.id].expanded = false;
            var mm = this.modelsMap;
            mm[go.id].childrenViewElement = undefined;

            function eraseViews(gameObject) {
                var cur = mm[gameObject.id];
                if (!cur) {
                    return;
                }
                mm[gameObject.id].viewElement = undefined;
                mm[gameObject.id].childrenViewElement = undefined;

                if (!gameObject.children) {
                    return;
                }
                for (var i = 0; i < gameObject.children.length; ++i) {
                    eraseViews(gameObject.children[i]);
                }
            }

            for (var i = 0; i < go.children.length; ++i) {
                eraseViews(go.children[i]);
            }
        }
    }
}