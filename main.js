const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')
const ProgressBar = require('electron-progressbar')
const NewsAPI = require('newsapi')

let newsapi;
let progressBar;
require('dotenv').config({path: path.join(__dirname, ".env")})

try {
    newsapi = new NewsAPI(process.env.NEWSAPIKEY)
    
} catch (error) {
    console.error("ERROR DETECTED WHILE LOADING NEWSAPI... JUST IGNORING...")
}

autoUpdater.autoDownload = false;
autoUpdater.checkForUpdates()

const createWindow = () => {
    const win = new BrowserWindow({
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
        label: "File",
        role: "filemenu"
    },
    {
        label: "View",
        role: "viewmenu"
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
        country: "kr",
        pageSize: 5
    })
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