var windowTypes = [
    {
        name: 'None',
        generator: function(root) {
            console.log('None window');
        }
    },
    {
        name: 'Explorer',
        generator: function(root) {
            console.log('Explorer window');
        }
    }
];

module.exports = windowTypes;