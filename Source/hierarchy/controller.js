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

function parentOF(go, id) {
    if (id === 0) {
        return;
    }
    for (var i = 0; i < go.children.length; ++i) {
        if (go.children[i].id === id) {
            return go;
        }
        var res = parentOF(go.children[i], id);
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

        go.children.push(newGO);
        var view = require('./view');
        view.api.refresh();
    },
    delete: function(id) {
        var model = require('./model');
        var view = require('./view');
        var go = parentOF(model.selectedPrefab, id);

        if (go) {
            var arr = [];
            for (var i = 0; i < go.children.length; ++i) {
                if (go.children[i].id !== id) {
                    arr.push(go.children[i]);
                }
            }
            go.children = arr;
        }
        view.api.refresh();
    }
}