const { app, BrowserWindow } = require('electron');
const path = require('path');

let win;

app.whenReady().then(() => {
    win = new BrowserWindow({
        width: 400,
        height: 400,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
    win.setAlwaysOnTop(true, 'screen-saver');
    win.setIgnoreMouseEvents(false); // gör knappen klickbar
    win.setFullScreenable(false);
});
