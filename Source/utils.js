var utils = {
    readFiles: function (dir, files, callback) {
        var index = 0;
        var views = {};
        function read() {
            if (index >= files.length) {
                callback(views);
                return;
            }
            var filename = files[index];
            var fs = require('fs');
            fs.readFile(dir + filename, function (err, data) {
                if (err) {
                    console.log(err);
                }
                views[filename] = data.toString();
                ++index;
                read();
            });
        }

        read();
    },
    findSubWindow: function (elem) {
        var sw = elem;
        while (!sw.getAttribute('subwindow')) {
            sw = sw.parentElement;
        }
        sw = sw.getAttribute('subwindow');
        sw = parseInt(sw);
        var swController = require('./Layout/controller');
        sw = swController.viewToModelMap[sw];
        return sw;
    },
    removeFiles: function (files, callback) {
        index = 0;
        function remove() {
            if (index == files.length) {
                if (callback) {
                    callback();
                }
                return;
            }

            var fs = require('fs');

            if (fs.lstatSync(files[index]).isDirectory()) {
                fs.rmdir(files[index], function () {
                    ++index;
                    remove();
                });
            } else {
                fs.unlink(files[index], function () {
                    index++;
                    remove();
                });
            }
        }
        remove();
    },
    updateComponentInstance: function (comp) {

        function copyParam(p) {
            var res = {
                name: p.name,
                type: p.type,
            };
            if (p.type === 'array') {
                p.value = [];
                res.defaultElement = copyParam(p.defaultElement);
                for (var i = 0; i < p.value.length; ++i) {
                    res.value.push(copyParam(p.value[i]));
                }
                return res;
            }
            if (p.type === 'custom') {
                res.value = {};
                for (var prop in p.value) {
                    res.value[prop] = copyParam(p.value[prop]);
                }
                return res;
            }
            res.value = p.value;
            return res;
        }

        function updateParams(fromScript, fromData) {
            for (var p in fromData) {
                if (!fromScript[p]) {
                    continue;
                }

                var script = fromScript[p];
                var data = fromData[p];

                if (script.type !== data.type) {
                    continue;
                }

                if (data.type === 'array' && data.defaultElement.type === script.defaultElement.type) {
                    script.value = [];
                    for (var i = 0; i < data.value.length; ++i) {
                        var elem = copyParam(script.defaultElement);
                        updateParams(elem, data.value[i]);
                        script.value.push(elem);
                    }
                    return;
                }
                if (data.type === 'custom') {
                    for (var prop in data.value) {
                        if (script.value[prop]) {
                            updateParams(script.value[prop], data.value[prop]);
                        }
                    }
                    return;
                }

                script.value = data.value;
            }
        }

        function updateComponentInstance(component) {
            var projectModel = require('./Project/model');
            var fe = projectModel.fileEntries[component.script];
            var script = require(projectModel.getProjectFolder() + fe.path);
            var newInstance = script.createInstance();
            updateParams(newInstance.params, component.instance.params);
            component.instance = newInstance;
        }

        updateComponentInstance(comp);
    }
};

module.exports = utils;