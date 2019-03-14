var utils = {
    getCoordinatesIn: function(x, y, element, targetElement) {
        var res = [x, y];
        if (element === targetElement) {
            return res;
        }
        do {
            element = element.parentElement;
            res[0] += element.offsetLeft;
            res[1] += element.offsetTop;
        } while (element !== targetElement);
        return res;
    }
};

module.exports = utils;