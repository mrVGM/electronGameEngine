module.exports = {
    create: function(parent, addContent) {
        var cont = document.createElement('div');
        parent.appendChild(cont);
        cont.setAttribute('class', 'full-size positionable container');
        cont.ctx = {
            parentContainer: parent,
            splitType: undefined,
            subContainers: [],
            content: addContent ? require('./subwindow').create(cont) : undefined,
            splitRight: function() {
                var newlyCreated;
                if (this.splitType !== 'horizontal') {
                    this.splitType = 'horizontal';
                    var newCont = module.exports.create(this.parentContainer);

                    newCont.style.width = cont.style.width;
                    newCont.style.height = cont.style.height;
                    newCont.style.top = cont.style.top;
                    newCont.style.left = cont.style.left;

                    newCont.appendChild(cont);
                    newCont.ctx.subContainers.push(cont);


                    cont.style.width = '50%';
                    cont.style.height = '100%';
                    cont.style.left = '0%';
                    cont.style.top = '0%';

                    cont.ctx.parentContainer = newCont;

                    var additionalCont = module.exports.create(newCont, true);
                    additionalCont.style.width = '50%';
                    additionalCont.style.left = '50%';
                    newCont.ctx.subContainers.push(additionalCont);
                    newlyCreated = additionalCont;
                } else if (this.splitType == 'horizontal') {
                    var newCont = module.exports.create(this.parentContainer, true);
                    this.parentContainer.ctx.subContainers.push(newCont);
                    var w = 50 * cont.offsetWidth / this.parentContainer.offsetWidth;
                    cont.style.width = w + '%';
                    newCont.style.width = w + '%';
                    var l = 100 * (cont.offsetLeft + cont.offsetWidth) / this.parentContainer.offsetWidth;
                    newCont.style.left = l + '%';
                    newlyCreated = newCont;
                }
                newlyCreated.ctx.splitType = 'horizontal';

                var dash = document.createElement('div');
                this.parentContainer.appendChild(dash);
                dash.setAttribute('class', 'separator-vertical positionable');
                dash.style.width = '4px';
                dash.style.height = '100%';
                
                dash.style.left = 100 * (newlyCreated.offsetLeft - 2) / this.parentContainer.offsetWidth + '%';
                
                dash.ctx = {
                    affected: [cont, newlyCreated],
                    parentContainer: this.parentContainer
                };

                dash.addEventListener('mousedown', function(e) {
                    var slide = document.createElement('div');
                    slide.setAttribute('class', 'positionable');
                    slide.style.left = dash.ctx.affected[0].offsetLeft + 'px';
                    slide.style.width = dash.ctx.affected[0].offsetWidth + dash.ctx.affected[1].offsetWidth + 'px';
                    slide.style.height = '100%';

                    dash.ctx.parentContainer.appendChild(slide);

                    slide.addEventListener('mousemove', function(e) {
                        var pos = dash.ctx.affected[0].offsetLeft + e.offsetX;
                        dash.style.left = 100 * (pos - 2) / dash.ctx.parentContainer.offsetWidth + '%';
                        dash.ctx.affected[0].style.width = 100 * (pos - dash.ctx.affected[0].offsetLeft) / dash.ctx.parentContainer.offsetWidth + '%';
                        dash.ctx.affected[1].style.width = 100 * (dash.ctx.affected[1].offsetLeft + dash.ctx.affected[1].offsetWidth - pos) / dash.ctx.parentContainer.offsetWidth + '%';
                        dash.ctx.affected[1].style.left = 100 * pos / dash.ctx.parentContainer.offsetWidth + '%';
                    });
                    slide.addEventListener('mouseup', function(e) {
                        dash.ctx.parentContainer.removeChild(slide);
                    });
                });
            },
            splitDown: function() {
                var newlyCreated;
                if (this.splitType !== 'vertical') {
                    this.splitType = 'vertical';
                    var newCont = module.exports.create(this.parentContainer);

                    newCont.style.width = cont.style.width;
                    newCont.style.height = cont.style.height;
                    newCont.style.top = cont.style.top;
                    newCont.style.left = cont.style.left;

                    newCont.appendChild(cont);
                    newCont.ctx.subContainers.push(cont);


                    cont.style.width = '100%';
                    cont.style.height = '50%';
                    cont.style.left = '0%';
                    cont.style.top = '0%';

                    cont.ctx.parentContainer = newCont;

                    var additionalCont = module.exports.create(newCont, true);
                    additionalCont.style.height = '50%';
                    additionalCont.style.top = '50%';
                    newCont.ctx.subContainers.push(additionalCont);
                    newlyCreated = additionalCont;
                } else if (this.splitType == 'vertical') {
                    var newCont = module.exports.create(this.parentContainer, true);
                    this.parentContainer.ctx.subContainers.push(newCont);
                    var h = 50 * cont.offsetHeight / this.parentContainer.offsetHeight;
                    cont.style.height = h + '%';
                    newCont.style.height = h + '%';
                    var l = 100 * (cont.offsetTop + cont.offsetHeight) / this.parentContainer.offsetHeight;
                    newCont.style.top = l + '%';
                    newlyCreated = newCont;
                }
                newlyCreated.ctx.splitType = 'vertical';

                var dash = document.createElement('div');
                this.parentContainer.appendChild(dash);
                dash.setAttribute('class', 'separator-horizontal positionable');
                dash.style.height = '4px';
                dash.style.width = '100%';
                
                dash.style.top = 100 * (newlyCreated.offsetTop - 2) / this.parentContainer.offsetHeight + '%';
                
                dash.ctx = {
                    affected: [cont, newlyCreated],
                    parentContainer: this.parentContainer
                };

                dash.addEventListener('mousedown', function(e) {
                    var slide = document.createElement('div');
                    slide.setAttribute('class', 'positionable');
                    slide.style.left = dash.ctx.affected[0].offsetTop + 'px';
                    slide.style.height = dash.ctx.affected[0].offsetHeight + dash.ctx.affected[1].offsetHeight + 'px';
                    slide.style.width = '100%';

                    dash.ctx.parentContainer.appendChild(slide);

                    slide.addEventListener('mousemove', function(e) {
                        var pos = dash.ctx.affected[0].offsetTop + e.offsetY;
                        dash.style.top = 100 * (pos - 2) / dash.ctx.parentContainer.offsetHeight + '%';
                        dash.ctx.affected[0].style.height = 100 * (pos - dash.ctx.affected[0].offsetTop) / dash.ctx.parentContainer.offsetHeight + '%';
                        dash.ctx.affected[1].style.height = 100 * (dash.ctx.affected[1].offsetTop + dash.ctx.affected[1].offsetHeight - pos) / dash.ctx.parentContainer.offsetHeight + '%';
                        dash.ctx.affected[1].style.top = 100 * pos / dash.ctx.parentContainer.offsetHeight + '%';
                    });
                    slide.addEventListener('mouseup', function(e) {
                        dash.ctx.parentContainer.removeChild(slide);
                    });
                });
            }
        }
        return cont;
    }
};