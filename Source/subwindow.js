module.exports = {
    create: function(parent) {
        var wnd = document.createElement('div');
        parent.appendChild(wnd);

        wnd.setAttribute('class', 'full-size positionable subwindow');

        var h = document.createElement('div');
        h.style.width = '100%';
        h.style.height = '15px';

        wnd.appendChild(h);
        
        var hPerc = 100 * h.offsetHeight / wnd.offsetHeight;

        var contents = document.createElement('div');
        contents.style.width = '100%';
        
        contents.setAttribute('class', 'unselectable');

        wnd.appendChild(contents);
        
        var header = require('./header');
        header.createHeader(h, wnd);

        wnd.ctx = {
            container: parent
        };
    }
}