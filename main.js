const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const NewsAPI = require('newsapi')

require('dotenv').config()


const newsapi = new NewsAPI(process.env.NEWSAPIKEY)

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