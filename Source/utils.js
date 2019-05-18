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
    createInstance: function (script) {
        if (!script.extendsFrom) {
            return script.createInstance();
        }
        var projectModel = require('./Project/model');
        var baseScript = undefined;
        for (var feId in projectModel.fileEntries) {
            if (projectModel.fileEntries[feId].path === script.extendsFrom) {
                baseScript = projectModel.fileEntries[feId];
                break;
            }
        }
        baseScript = require(projectModel.getProjectFolder() + baseScript.path);
        var baseInstance = utils.createInstance(baseScript);
        var instance = script.createInstance();
        for (var p in instance.params) {
            baseInstance.params[p] = instance.params[p];
        }
        baseInstance.name = instance.name;
        return baseInstance;
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

        function updateSingleParam(fromScript, fromData) {
            if (fromData.type !== fromData.type)
                return;

            if (fromData.type === 'array') {
                fromScript.value = [];
                for (var i = 0; i < fromData.value.length; ++i) {
                    var elem = copyParam(fromScript.defaultElement);
                    updateSingleParam(elem, fromData.value[i]);
                    elem.name = fromData.value[i].name;
                    fromScript.value.push(elem);
                }
                return;
            }

            if (fromData.type === 'custom') {
                updateParams(fromScript.value, fromData.value);
                return;
            }

            fromScript.value = fromData.value;
        }

        function updateParams(fromScript, fromData) {
            for (var p in fromData) {
                if (!fromScript[p]) {
                    continue;
                }

                updateSingleParam(fromScript[p], fromData[p]);
            }
        }

        function updateComponentInstance(component) {
            var projectModel = require('./Project/model');
            var fe = projectModel.fileEntries[component.script];
            var script = require(projectModel.getProjectFolder() + fe.path);
            var newInstance = utils.createInstance(script);
            updateParams(newInstance.params, component.instance.params);
            component.instance = newInstance;
        }

        updateComponentInstance(comp);
    }
};

module.exports = utils;