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
            }
        }
        this.ctx.data = undefined;
        this.ctx.type = undefined;
    }
}

module.exports = dragContext;