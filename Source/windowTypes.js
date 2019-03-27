module.exports = {
    windowTypes: [
        {
            type: 'FileExplorer',
            init: function(parent) {
                require('./project/view').init(parent);
            }
        },
        {
            type: 'Hierarchy',
            init: function(parent) {
                require('./hierarchy/view').init(parent);
            }
        }
    ]
}