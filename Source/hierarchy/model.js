module.exports = {
    idCounter: 1,
    selectedPrefab: {
        name: 'Root',
        id: 0,
        children: []
    },
    createGameObject: function() {
        var id = this.idCounter;
        this.idCounter++;
        return {
            name: 'GameObject',
            id: id,
            children: []
        };
    }
}