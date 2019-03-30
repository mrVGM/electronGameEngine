module.exports = {
    windowTypes: [
        {
            type: 'FileExplorer',
            init: function(parent) {
                require('./project/model').init(function() {
                    require('./project/controller').init();
                    require('./project/view').init(parent);
                });
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