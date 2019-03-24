var eventManageId = 0;

module.exports = {
    getEventManager: function(mainElement) {
        var em = {
            id: eventManageId,
            mainElement: mainElement,
            events: [],
            getCoordinates: function(coord, elem) {
                var res = [coord[0], coord[1]];
                var cur = elem;
                while (cur !== this.mainElement) {
                    res[0] += cur.offsetLeft;
                    res[1] += cur.offsetTop;
                    cur = cur.parentElement;
                }
                return res;
            },
            registerEvent: function(element, handler) {
                this.events.push({
                    element: element,
                    handler: handler,
                    active: true,
                });
            },
            triggerEventHandler: function(event) {
                var coord = this.getCoordinates([event.offsetX, event.offsetY], event.target);
                for (var i = 0; i < this.events.length; ++i) {
                    var e = this.events[i];
                    var topLeft = this.getCoordinates([e.element.offsetLeft, e.element.offsetTop], e.element);
                    var bottomRight = this.getCoordinates([e.element.offsetLeft + e.element.offsetWidth, e.element.offsetTop + e.element.offsetHeight], e.element);
                                        
                    if (coord[0] <= topLeft[0] || bottomRight[0] <= coord[0]) {
                        continue;
                    }
                    if (coord[1] <= topLeft[1] || bottomRight[1] <= coord[1]) {
                        continue;
                    }

                    if (e.active) {
                        e.handler(event, coord, e.element);
                    }
                }
            },
            clearEvents: function() {
                this.events = [];
            }
        }
        eventManageId++;
        return em;
    }
};