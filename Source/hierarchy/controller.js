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
            this.modelsMap.childrenViewElement = undefined;
        }
    }
}