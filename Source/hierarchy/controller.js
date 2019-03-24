function searchId(go, id) {
    if (go.id === id) {
        return go;
    }
    for (var i = 0; i < go.children.length; ++i) {
        var res = searchId(go.children[i], id);
        if (res) {
            return res;
        }
    }
}

module.exports = {
    gameObjectProps: {},
    toggleGameObject: function(id) {
        if (!this.gameObjectProps[id]) {
            this.gameObjectProps[id] = {};
        }
        if (!this.gameObjectProps[id].expanded) {
            this.gameObjectProps[id].expanded = false;
        }
        this.gameObjectProps[id].expanded = !this.gameObjectProps[id].expanded;
        var view = require('./view');
        view.api.refresh();
    },
    remane: function(id, newName) {
        var model = require('./model');
        var go = searchId(model.selectedPrefab, id);
        go.name = newName;
        var view = require('./view');
        view.api.refresh();
    },
    create: function(id) {
        var model = require('./model');
        var newGO = model.createGameObject();
        var go = searchId(model.selectedPrefab, id);

        console.log(id, go, model.selectedPrefab);
        go.children.push(newGO);
        var view = require('./view');
        view.api.refresh();
    }
}