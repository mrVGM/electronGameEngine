var model = {
    projectRoot: undefined,
    init: function(postInit) {
        var electron = require('electron');
        var remote = electron.remote;
        var dialog = remote.dialog;
        
        var path = dialog.showOpenDialog({
            properties: ['openDirectory']
        });

        this.projectRoot = path[0];

        var assetsMapFile = this.projectRoot + '\\assetsMap.json';
        var projectRoot = this.projectRoot;

        var fs = require('fs');
        if (!fs.existsSync(assetsMapFile)) {
            this.assetsMap = {
                idCount: 0,
                assets: {}
            };

            var open = 0;

            function buildMap(dir) {
                ++open;

                model.assetsMap.assets[dir] = model.assetsMap.idCount++;
                
                if (fs.lstatSync(dir).isDirectory()) {
                    fs.readdir(dir, function(err, data) {
                        for (var i = 0; i < data.length; ++i) {
                            var p = dir + '\\' + data[i];
                            buildMap(p);
                        }
                        --open;
                        if (open === 0) {
                            model.flushAssetsMap();
                            postInit();
                        }
                    });
                } else {
                    --open;
                }

                if (open === 0) {
                    model.flushAssetsMap();
                    postInit();
                }
            }

            buildMap(projectRoot);
        } else {
            postInit();
        }
    },
    flushAssetsMap: function() {
        var assetsMapFile = model.projectRoot + '\\assetsMap.json';

        var fs = require('fs');
        fs.writeFile(assetsMapFile, JSON.stringify(model.assetsMap), function(err, info) {
            console.log(err, info);
        });
    },
    tree: {
        path: undefined,
    },
    createFile: function(path, data, callback) {
        var fs = require('fs');
        fs.writeFile(path, data, function(err) {
            if (err) {
                console.log(err);
            }
            model.flushAssetsMap();
            callback();
        });
        model.assetsMap.assets[path] = model.assetsMap.idCount++;
    },
    createFolder: function(path, callback) {
        var fs = require('fs');
        if (fs.existsSync(path)) {
            callback();
            return;
        }
        fs.mkdir(path, function() {
            model.assetsMap.assets[path] = model.assetsMap.idCount++;
            model.flushAssetsMap();
            callback();
        });
    },
    delete: function(path, cb) {
        var fs = require('fs');
        var toDel = [];
        var open = 0;
        function del(path, callback) {
            console.log(path);
            ++open;
            toDel.push(path);
            if (!fs.lstatSync(path).isDirectory()) {
                delete model.assetsMap.assets[path];
                --open;
                if (open === 0) {
                    callback();
                }
                return;
            }
            fs.readdir(path, function(err, data) {
                console.log(data);

                for (var i = 0; i < data.length; ++i) {
                    var cur = path + '\\' + data[i];
                    del(cur, callback);
                }
                --open;
                if (open === 0) {
                    callback();
                }
            });
        }
        
        del(path, function() {
            for (var i = toDel.length - 1; i >= 0; --i) {
                if (!fs.lstatSync(toDel[i]).isDirectory()) {
                    fs.unlinkSync(toDel[i]);
                }
                else {
                    fs.rmdirSync(toDel[i]);
                }
                delete model.assetsMap.assets[toDel[i]];
            }
            model.flushAssetsMap();
            cb();
        });
    },
    assetsMap: {},
};

module.exports = model;