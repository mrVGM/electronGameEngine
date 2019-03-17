var model = require('./model');
var controller = require('./controller');

module.exports = {
    root: undefined,
    init: function(parent) {
        while(parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }

        this.root = document.createElement('div');
        this.root.style.position = 'relative';
        this.root.style.left = '15px';
        parent.appendChild(this.root);
        var cont = document.createElement('div');
        this.root.appendChild(cont);
        this.api.visualize(model.selectedPrefab, cont);
    },
    api: {
        visualize: function(go, parent) {
            var el = document.createElement('div');
            var name = document.createElement('div');
            el.appendChild(name);
            var offset = 0;
            var icon;
            if (go.children && go.children.length > 0) {
                icon = document.createElement('div');
                icon.setAttribute('class', 'arrow-icon');
                name.appendChild(icon);
                offset = 15;
                icon.addEventListener('mousedown', function() {
                    controller.toggle(go);
                    if (controller.modelsMap[go.id].expanded) {
                        icon.setAttribute('class', 'arrow-icon-rotated');
                    }
                    else {
                        icon.setAttribute('class', 'arrow-icon');
                    }
                });
            }
        
            var text = document.createElement('div');
            text.innerHTML = go.name;
            text.style.position = 'absolute';
            text.style.left = offset + 'px';
            text.style.top = '0px';
        
            name.appendChild(text);
            
            name.style.height = '20px';

            if (!controller.modelsMap[go.id]) {
                controller.modelsMap[go.id] = {
                    viewElement: el,
                    expanded: false
                };
            }

            controller.modelsMap[go.id].viewElement = el;

            if (controller.modelsMap[go.id].expanded) {
                this.expand(go);
            }

            parent.appendChild(el);
        },
        expand: function(go) {
            var data = controller.modelsMap[go.id];

            var childrenViewElement = document.createElement('div');
            data.viewElement.parentElement.appendChild(childrenViewElement);
            data.childrenViewElement = childrenViewElement;

            childrenViewElement.style.position = 'relative';
            childrenViewElement.style.left = '15px';

            for (var i = 0; i < go.children.length; ++i) {
                var cur = go.children[i];
                this.visualize(cur, childrenViewElement);
            }
        },
        collapse: function(go) {
            controller.modelsMap[go.id].childrenViewElement.parentElement.removeChild(controller.modelsMap[go.id].childrenViewElement);
        }
    }
}