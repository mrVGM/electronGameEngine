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
    }
};

module.exports = utils;