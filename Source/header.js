module.exports = {
    createHeader: function(parent, subwindow) {
        var arrowdown = document.createElement('div');
        arrowdown.setAttribute('class', 'add-button-down');

        arrowdown.addEventListener('mousedown', function() {
            console.log(subwindow, subwindow.ctx.container);
            subwindow.ctx.container.ctx.splitDown();
        });

        parent.appendChild(arrowdown);
        
        var arrowright = document.createElement('div');
        arrowright.setAttribute('class', 'add-button-right');
        parent.appendChild(arrowright);

        arrowright.addEventListener('mousedown', function() {
            console.log(subwindow, subwindow.ctx.container);
            subwindow.ctx.container.ctx.splitRight();
        });

        var windowType = document.createElement('div');
        windowType.setAttribute('class', 'window-type');
        parent.appendChild(windowType);

        var windowTypes = require('./windowTypes').windowTypes;

        var current = document.createElement('span');
        current.innerText = 'None';
        windowType.appendChild(current);

        var expanded = false;

        var space = document.createElement('span');
        space.innerText = ' ';
        windowType.appendChild(space);
        var options = document.createElement('span');
        
        windowType.appendChild(options);

        function toggle(e) {
            if (expanded) {
                var children = [];
                while (options.firstChild) {
                    options.removeChild(options.firstChild);
                }
            }
            else {
                for (var i = 0; i < windowTypes.length; ++i) {
                    var wt = windowTypes[i];
                    var tmp = document.createElement('span');
                    tmp.wt = wt;
                    tmp.innerText = wt.type;
                    tmp.setAttribute('class', 'window-type-option');
                    options.appendChild(tmp);
                    tmp.addEventListener('mousedown', function(evt) {
                        current.innerText = evt.srcElement.wt.type;
                        evt.srcElement.wt.init(subwindow.ctx.contents);
                        toggle();
                    });
                    space = document.createElement('span');
                    space.innerText = ' ';
                    options.appendChild(space);
                }
            }
            expanded = !expanded;
        }

        current.addEventListener('mousedown', toggle);
    }
};