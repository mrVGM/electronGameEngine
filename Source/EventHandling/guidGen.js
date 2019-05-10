var guidGen = {
    idCount: 1,
    generateId: function() {
        return guidGen.idCount++;
    }
}

module.exports = guidGen;