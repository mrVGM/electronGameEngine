var imports = require('./imports');
var utils = imports.utils();
var eventManager = utils.eventManager;

var dashSize = 4;

var subWindows = {
    subWindows: [],
    root: undefined,
    create: function() {
        var frame = document.createElement('div');
        frame.setAttribute('class', 'full-size');

        var downButton = document.createElement('div');
        downButton.setAttribute('class', 'add-button-down');
        downButton.mousedown = this.branchDown;

        var rightButton = document.createElement('div');
        rightButton.setAttribute('class', 'add-button-right');
        rightButton.mousedown = this.branchRight;

        var windowType = document.createElement('div');
        var typeText = document.createElement('div');
        typeText.innerText = 'None';
        windowType.appendChild(typeText);
        windowType.setAttribute('class', 'window-type');

        var options = document.createElement('div');
        windowType.appendChild(options);

        var expanded = false;
        
        var content = document.createElement('div');
        content.setAttribute('class', 'subwindow-content');

        function toggleWindowType() {
            if (expanded) {
                var nodes = [];
                for (var i = 0; i < options.childNodes.length; ++i) {
                    nodes.push(options.childNodes[i]);
                }
                for (var i = 0; i < nodes.length; ++i) {
                    options.removeChild(nodes[i]);
                }
            }
            else {
                var wt = imports.windowTypes();
                for (var i = 0; i < wt.length; ++i) {
                    var tmp = document.createElement('div');

                    tmp.innerText = wt[i].name;
                    eventManager.addHandler('mousedown', tmp, function(e) {
                        console.log('greherd');
                    });
                    options.appendChild(tmp);
                }
            }
            expanded = !expanded;
        }

        eventManager.addHandler('mousedown', typeText, toggleWindowType);
        
        frame.appendChild(downButton);
        frame.appendChild(rightButton);
        frame.appendChild(windowType);
        frame.appendChild(content);

        return frame;
    },
    createContainer: function(cont) {
        var subWindowsRoot = document.createElement('div');
        subWindowsRoot.setAttribute('class', 'full-size positionable');
        if (!cont) {
            cont = this.create();
        }
        subWindowsRoot.appendChild(cont);
        cont.context = {
            container: subWindowsRoot
        };
        subWindowsRoot.context = {
            elem: subWindowsRoot,
            splitType: undefined,
            parent: undefined,
            children: [],
            dashes: [],
            content: cont,
            dragedDash: undefined,
            mousemove: function(e) {
                var coord = utils.getCoordinatesIn(e.offsetX, e.offsetY, e.srcElement, subWindowsRoot);
                var ctx = subWindowsRoot.context;
                if (!ctx.dragedDash) {
                    return;
                }
                var d = (ctx.splitType == 'horizontal') ? ctx.dragedDash.lastPos[0] - coord[0] : ctx.dragedDash.lastPos[1] - coord[1];
                if (d < 100) {
                    ctx.dragedDash.lastPos = coord;
                }
            },
            mouseup: function(e) {
                subWindowsRoot.removeEventListener('mousemove', subWindowsRoot.context.mousemove);
                subWindowsRoot.removeEventListener('mouseup', subWindowsRoot.context.mouseup);
                subWindowsRoot.context.dragedDash.update = false;
            },
            addDash: function(pos) {
                var widthPerc;
                var dash = document.createElement('div');
                if (this.splitType == 'horizontal') {
                    widthPerc = 100 * dashSize / this.elem.offsetWidth;
                    dash.style.left = (pos - widthPerc / 2).toString() + '%';
                    dash.style.width = dashSize.toString() + 'px';
                    dash.style.height = '100%';
                    dash.setAttribute('class', 'separator-vertical positionable');
                }
                else {
                    widthPerc = 100 * dashSize / this.elem.offsetHeight;
                    dash.style.top = (pos - widthPerc / 2).toString() + '%';
                    dash.style.height = dashSize.toString() + 'px';
                    dash.style.width = '100%';
                    dash.setAttribute('class', 'separator-horizontal positionable');
                }
                this.dashes.push(dash);
                this.elem.appendChild(dash);

                dash.mousedown = function(e) {
                    subWindowsRoot.context.dragedDash = {
                        dash: e.srcElement,
                        subWnd: subWindowsRoot,
                        affectedSubWnd: subWindowsRoot.context.getAffected(e.srcElement),
                        update: true,
                        lastPos: [e.srcElement.offsetLeft + e.srcElement.offsetWidth / 2, e.srcElement.offsetTop + e.srcElement.offsetHeight / 2],
                        updateFunc: function() {
                            var start = (new Date()).getMilliseconds();
                            var t = this;
                            function f() {
                                var now = (new Date()).getMilliseconds();
                                if (!t.update || (now - start) >= 2000) {
                                    t.subWnd.context.dragedDash = undefined;
                                    return;
                                }
                                var coord = t.lastPos;
                                if (t.subWnd.context.splitType == 'horizontal') {
                                    t.dash.style.left = (100 * (coord[0] - dashSize / 2) / t.subWnd.offsetWidth) + '%';
                                    t.affectedSubWnd[0].style.width = (100 * (coord[0] - t.affectedSubWnd[0].offsetLeft) / t.subWnd.offsetWidth) + '%';
                                    t.affectedSubWnd[1].style.width = (100 * (t.affectedSubWnd[1].offsetLeft + t.affectedSubWnd[1].offsetWidth - coord[0]) / t.subWnd.offsetWidth) + '%';
                                    t.affectedSubWnd[1].style.left = (100 * coord[0] / t.subWnd.offsetWidth) + '%';
                                }
                                else {
                                    t.dash.style.top = (100 * (coord[1] - dashSize / 2) / t.subWnd.offsetHeight) + '%';
                                    t.affectedSubWnd[0].style.height = (100 * (coord[1] - t.affectedSubWnd[0].offsetTop) / t.subWnd.offsetHeight) + '%';
                                    t.affectedSubWnd[1].style.height = (100 * (t.affectedSubWnd[1].offsetHeight + t.affectedSubWnd[1].offsetHeight - coord[1]) / t.subWnd.offsetHeight) + '%';
                                    t.affectedSubWnd[1].style.top = (100 * coord[1] / t.subWnd.offsetHeight) + '%';
                                }
                                setTimeout(f, 50);
                            }
                            f();
                        }
                    };

                    subWindowsRoot.mousemove = subWindowsRoot.context.mousemove;
                    subWindowsRoot.mouseup = subWindowsRoot.context.mouseup;
                    subWindowsRoot.context.dragedDash.updateFunc();
                };
            },
            getAffected: function(dash) {
                if (this.elem.context.splitType === 'horizontal') {
                    var dashPos = dash.offsetLeft + dash.offsetWidth / 2;
                    var index = 0;

                    while(this.children[index].offsetLeft + this.children[index].offsetWidth / 2 < dashPos) {
                        index++;
                    }
                    return [this.children[index - 1], this.children[index]];
                }
                var dashPos = dash.offsetTop + dash.offsetHeight / 2;
                var index = 0;
                while(this.children[index].offsetTop + this.children[index].offsetHeight / 2 < dashPos) {
                    index++;
                }
                return [this.children[index - 1], this.children[index]];
            }
        };
        
        return subWindowsRoot;
    },
    init: function(appRoot) {
        var cont = this.createContainer();
        appRoot.appendChild(cont);
        this.root = cont;
    },
    branchRight: function(e) {
        var container = e.srcElement.parentElement.context.container;
        if (container.context.parent && container.context.parent.context.splitType == 'horizontal') {
            console.log('fegre');
            var parentContainer = container.context.parent;
            var width = 50 * container.offsetWidth / parentContainer.offsetWidth;
            container.style.width = width.toString() + '%';
            
            var pos = 0;
            var index = 0;
            while (parentContainer.context.children[index] != container) {
                pos += parentContainer.context.children[index].offsetWidth;
                ++index;
            }

            pos += container.offsetWidth;

            pos /= parentContainer.offsetWidth;
            var newCont = subWindows.createContainer();
            newCont.style.left = (100 * pos).toString() + '%';
            newCont.style.top = '0%';
            newCont.style.width = width.toString() + '%';
            parentContainer.appendChild(newCont);
            index++;
            parentContainer.context.children.splice(index, 0, newCont);
            parentContainer.context.addDash(100 * pos);
            newCont.context.parent = parentContainer;
        }
        else {
            var cur = subWindows.createContainer(container.context.content);
            container.context.children.push(cur);
            cur.context.parent = container;
            container.appendChild(cur);
            cur.style.width = '50%';

            var newCont = subWindows.createContainer();
            container.context.children.push(newCont);
            newCont.context.parent = container;
            container.appendChild(newCont);
            newCont.style.width = '50%';
            newCont.style.left = '50%';

            container.context.splitType = 'horizontal';
            container.context.addDash(50);
        }

    },
    branchDown: function(e) {
        var container = e.srcElement.parentElement.context.container;
        if (container.context.parent && container.context.parent.context.splitType == 'vertical') {
            var parentContainer = container.context.parent;
            var height = 50 * container.offsetHeight / parentContainer.offsetHeight;
            container.style.height = height.toString() + '%';
            
            var pos = 0;
            var index = 0;
            while (parentContainer.context.children[index] != container) {
                pos += parentContainer.context.children[index].offsetHeight;
                ++index;
            }
            pos += container.offsetHeight;
            pos /= parentContainer.offsetHeight;
            var newCont = subWindows.subWindows.createContainer();
            newCont.style.top = (100 * pos).toString() + '%';
            newCont.style.left = '0%';
            newCont.style.height = height.toString() + '%';
            parentContainer.appendChild(newCont);
            index++;
            parentContainer.context.children.splice(index, 0, newCont);
            parentContainer.context.addDash(100 * pos);
            newCont.context.parent = parentContainer;
        }
        else {
            var cur = subWindows.createContainer(container.context.content);
            container.context.children.push(cur);
            cur.context.parent = container;
            container.appendChild(cur);
            cur.style.height = '50%';

            var newCont = subWindows.createContainer();
            container.context.children.push(newCont);
            newCont.context.parent = container;
            container.appendChild(newCont);
            newCont.style.height = '50%';
            newCont.style.top = '50%';

            container.context.splitType = 'vertical';
            container.context.addDash(50);
        }
    }
};

module.exports = subWindows;