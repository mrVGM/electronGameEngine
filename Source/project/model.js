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
                            model.flushAssetsMap(assetsMapFile);
                            postInit();
                        }
                    });
                } else {
                    --open;
                }

                if (open === 0) {
                    model.flushAssetsMap(assetsMapFile);
                    postInit();
                }
            }

            buildMap(projectRoot);
        } else {
            postInit();
        }
    },
    flushAssetsMap: function(file) {
        var fs = require('fs');
        fs.writeFile(file, JSON.stringify(model.assetsMap), function(err, info) {
            console.log(err, info);
        });
    },
    tree: {
        path: undefined,
    },
    assetsMap: {},
};

module.exports = model;