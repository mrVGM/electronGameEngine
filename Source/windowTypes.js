module.exports = {
    windowTypes: [
        {
            type: 'FileExplorer',
            init: function(parent) {
                require('./fileExplorer')().init(parent, __dirname);
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