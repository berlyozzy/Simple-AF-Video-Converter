const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require('fs');
const util = require('util');
const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg');
require ('hazardous');

try {
    require("electron-reloader")(module);
} catch (_) {}

let mainWindow;
let childWindow;
let ffmpeg;

const presets = [
    {
        name : "WebM",
        options : "-c:v libvpx-vp9 -lossless 1",
        extension : "webm"
    },
    {
        name : "MP4",
        options : "-c:v libx264 -preset slow -qp 0",
        extension : "mp4"
    },
    {
        name : "AVI",
        options : "-c:v libx264 -c:a libmp3lame -b:a 384K",
        extension : "avi"
    },
    {
        name : "Custom",
        options : "",
        extension : ""
    }
]

const presets_directory = `${app.getPath('documents')}\\SimpleVideoEditor`
const presets_path = `${presets_directory}\\presets.json`;

try {

    if( !fs.existsSync(presets_directory)){

        fs.mkdirSync(presets_directory);
        fs.writeFileSync(presets_path, JSON.stringify(presets));

    }else{

        if (!fs.existsSync(presets_path)) {
            fs.writeFileSync(presets_path, JSON.stringify(presets));
        }
    }

} catch(err) {
    console.error(err)
}

function createWindow () {

    const iconPath = path.join(__dirname, "public/images/icon.png");

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1000,
        minHeight: 600,
        alwaysOnTop: false,
        frame: false,
        show: false,
        icon: iconPath,
        webPreferences: {
            devTools: !app.isPackaged,
            preload: path.join(__dirname, "public/js/preload.js"),
            contextIsolation: true
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "public/index.html"))
    // mainWindow.removeMenu()

    mainWindow.once("ready-to-show", () => {

        mainWindow.show();

        ffmpeg = createFFmpeg({ 
            corePath: path.join(__dirname, "node_modules/@ffmpeg/core/dist/ffmpeg-core.js"),
            log: false,
            logger : ({message}) => {
                mainWindow.webContents.send('progress', message)
            }
        });

        mainWindow.webContents.send('getDefaultPaths', {
            videos : app.getPath('videos'),
            presets : presets_path
        })

    });
  
    // Open the DevTools.
    // mainWindow.webContents.openDevTools(); 
}

function createChildWindow (data) {

    const iconPath = path.join(__dirname, "public/images/icon.png");

    // Create the browser window.
    childWindow = new BrowserWindow({
        width: 800,
        height: 1000,
        minWidth: 600,
        minHeight: 800,
        alwaysOnTop: false,
        parent: mainWindow,
        frame: false,
        show: false,
        icon: iconPath,
        webPreferences: {
            preload: path.join(__dirname, "public/js/preload.js"),
            contextIsolation: true
        }
    });

    childWindow.loadFile(path.join(__dirname, "public/child.html"))

    childWindow.once("ready-to-show", () => {
        childWindow.show();
        childWindow.webContents.send('ChildContent', data)
    });

}

app.whenReady().then(createWindow);
  
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on("Minimize", () => BrowserWindow.getFocusedWindow().minimize());

ipcMain.on("Close", () => {
    const win = BrowserWindow.getFocusedWindow();

    if (win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools()
    }

    win.close();
});

ipcMain.on("Size", () => {

    if(BrowserWindow.getFocusedWindow().isMaximized()){
        BrowserWindow.getFocusedWindow().unmaximize()
    }else{
        BrowserWindow.getFocusedWindow().maximize()
    }
   
});

ipcMain.handle('openFolder', async () => { 

    return await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] })
    .then(({filePaths}) => { return filePaths })

});  

ipcMain.handle('getPresets', async () => { 

    const readFile = util.promisify(fs.readFile);

    return await readFile(presets_path).then(result => {return JSON.parse(result)});

});

ipcMain.handle('updatePresets', async (e, data) => { 

    try{
        
        fs.writeFileSync(presets_path, JSON.stringify(data))
        return true

    }catch(error){
        
        console.log(error)
        return false
    }

});

ipcMain.handle('convertFile', async (e, details) => { 

    const {
        files,
        preset,
        path,
        name
    } = details;

    let status = [];

    if(!ffmpeg.isLoaded()){
        await ffmpeg.load();
    }else{
        status = []
    }

    async function Render ({file, id}) {

        const current_file_name = file.name
        const current_file_path = file.path
        const new_file_name = files.length > 1 ? `${name}_${id}.${preset.extension}` : `${name}.${preset.extension}`;
        const new_path = `${path}\\${new_file_name}`

        ffmpeg.FS('writeFile', current_file_name, await fetchFile(current_file_path));

        const parameters = ['-i', current_file_name, ...preset.options , new_file_name]
        await ffmpeg.run.apply(null, parameters);
        await fs.promises.writeFile(new_path, ffmpeg.FS('readFile', new_file_name));
        
    };

    for(const file in files){
        await Render({file : files[file], id: file})
        .then(_ => status.push({error : null, status : true }))
        .finally(_ => ffmpeg.FS('unlink', files[file].name ))
        .catch(error => status.push({error : error, status : false }));
    }

    return status;

});  

ipcMain.on("OpenChild", (event, data) => {
    createChildWindow(data)
})