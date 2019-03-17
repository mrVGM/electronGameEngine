module.exports = {
    windowTypes: [
        
        {
            type: 'File Explorer',
            init: function(parent) {
                require('./fileExplorer')().init(parent, __dirname);
            }
        }
    ]
}