module.exports = {
    windowTypes: [
        
        {
            type: 'Asd',
            init: function(parent) {
                console.log('Asd', parent);
                require('./fileExplorer').init(parent, __dirname);
                console.log(__dirname);
            }
        }
    ]
}