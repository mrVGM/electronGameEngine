var electron = require('electron');
var url = require('url');
var path = require('path');

var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var Menu = electron.Menu;

var mainWindow = undefined;

var mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Toggle Dev Tools',
                click: function() {
                    mainWindow.toggleDevTools();
                }
            }
        ]
    }
];

app.on('ready', function() {
    mainWindow = new BrowserWindow({});

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'main.html'),
        protocol: false,
        slashes: true
    }));

    var mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

module.exports = mainWindow;