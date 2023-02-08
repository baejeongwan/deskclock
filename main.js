const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const fs = require('fs')
const path = require('path')
const { autoUpdater } = require('electron-updater')
const ProgressBar = require('electron-progressbar')
const NewsAPI = require('newsapi')

let newsapi;
let progressBar;
let win;
let config = {};
require('dotenv').config({path: path.join(__dirname, ".env")})

loadConfiguration()

try {
    newsapi = new NewsAPI(process.env.NEWSAPIKEY)
    
} catch (error) {
    console.error("ERROR DETECTED WHILE LOADING NEWSAPI... JUST IGNORING...")
}



autoUpdater.autoDownload = false;
autoUpdater.checkForUpdates()

const createWindow = () => {
    win = new BrowserWindow({
        width: 1024,
        height: 600,
        autoHideMenuBar: true,
        fullscreen: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            webviewTag: true
        }
    })

    win.loadFile("index.html")
}

const template = [
    {
        role: "filemenu"
    },
    {
        role: "viewmenu"
    },
    {
        role: "help",
        submenu: [
            {
                label: "About",
                click () {
                    require('electron').dialog.showMessageBoxSync({message: "Deskclock Version " + require('electron').app.getVersion() + "\nBy Jayden Bae", type: "info", title: "About"})
                }
            }
        ]
    }
]

let newMenu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(newMenu)

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle("get-news-data", async (event) => {
    return await newsapi.v2.topHeadlines({
        country: getKey("newsGeo"),
        pageSize: 5
    })
})

ipcMain.on("check-for-update", e => {
    autoUpdater.checkForUpdatesAndNotify();
})

autoUpdater.addListener("update-available", info => {
    let returnNum = dialog.showMessageBoxSync({message: "Update to the version " + info.version + " is available!\nWould you like to download?", buttons: ["Yes, download now", "No, skip for now"], title: "Update available!"})
    if (returnNum == 0) {
        progressBar = new ProgressBar({
            indeterminate: false,
            text: "Downloading updates...",
            detail: "Wait...",
            maxValue: 100
        })
        autoUpdater.downloadUpdate()
    }
    
})

autoUpdater.addListener("download-progress", progress => {
    try {
        progressBar.value = progress.percent
        
    } catch (error) {
        console.error("FAILED DOWNLOAD")
    }
})

autoUpdater.addListener("update-downloaded", info => {
    progressBar.close()
    let returnNum = dialog.showMessageBoxSync({message: "Update to the version " + info.version + " is downloaded!\nWould you like to install now?", buttons: ["Yes, install now", "No, do on exit"], title: "Update available!"})
    if (returnNum == 0) {
        autoUpdater.quitAndInstall()
    }
})

//#region Config
function loadConfiguration() {
    let calculatedFilePath = path.join(app.getPath("userData"), "config.json")
    if (fs.existsSync(calculatedFilePath)) {
        let filetextdata = fs.readFileSync(calculatedFilePath, {encoding: "utf8"})
        config = JSON.parse(filetextdata)
        console.log("CONFIGURATION READY!")
    } else {
        fs.copyFileSync(path.join(__dirname, "default.json"), calculatedFilePath)
        console.log("CONFIGURATION GENERATED")
        loadConfiguration()
        
    }
}

function writeConfiguration() {
    let calculatedFilePath = path.join(app.getPath("userData"), "config.json")
    fs.writeFileSync(calculatedFilePath, JSON.stringify(config))
    //If there is data to report, report here
}

function getKey(keyName) {
    return config[keyName]
}

function setKey(keyName, value) {
    config[keyName] = value
    writeConfiguration()
}

ipcMain.handle('get-key', (e, arg) => {
    return getKey(arg)
})

ipcMain.on('set-key', (e, args) => {
    setKey(args.keyName, args.keyValue)
})

//#endregion