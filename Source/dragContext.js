var dragContext = {
    ctx: {
        data: undefined,
        type: undefined,
    },
    mouseUp: function(e) {
        var target = e.target;
        if (target.getAttribute('filetype') === 'dir') {
            if (this.ctx.type === 'gameObject') {
                console.log('prefab creation');
                console.log(this.ctx.data);
                var controller = require('./project/controller');
                var id = target.getAttribute('fileentryid');
                id = parseInt(id);
                console.log(id, controller.viewMap);
                var node = controller.viewMap[id];
                node.children = undefined;
                controller.createPrefab(this.ctx.data, node.path, function() {
                    controller.expand(node.id, node.expanded);
                });
            }
        }
        this.ctx.data = undefined;
        this.ctx.type = undefined;
    }
}

module.exports = dragContext;