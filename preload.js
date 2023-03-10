const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld("datareader", {
    getNewsData: () => {
        document.getElementById("refreshLink").innerHTML = `<i class="bi bi-arrow-clockwise"></i> Refreshing...`
        ipcRenderer.invoke("get-news-data").then((result) => {
            document.getElementById("newsList").innerHTML = ""
            if (result.status == "ok") {
                result.articles.forEach(element => {
                    let dataToWrite = "<li>" + element.title + ` <a href="javascript:void(0)" onclick="openAtWebview('${element.url}')">View More &raquo;</a></li>`
                    document.getElementById("newsList").innerHTML += dataToWrite
                });
                document.getElementById("refreshLink").innerHTML = `<i class="bi bi-arrow-clockwise"></i> Refresh`
            } else {
                document.getElementById("newsList").innerHTML = "<p>Cannot access to the News API. Please try again later.</p>"
                document.getElementById("refreshLink").innerHTML = `<i class="bi bi-arrow-clockwise"></i> Refresh`
            }
        }).catch((e) => {
            document.getElementById("newsList").innerHTML = "<p>Cannot access to the News API. Please try again later.</p>"
            document.getElementById("refreshLink").innerHTML = `<i class="bi bi-arrow-clockwise"></i> Refresh`
        })
    },
    checkUpdates: () => {
        ipcRenderer.send("check-for-update")
    },
    getConfigKey: (keyName) => {
        return getKey(keyName)
    },
    setConfigKey: (keyName, keyValue) => {
        setKey(keyName, keyValue)
    }
})

async function getKey(keyName) {
    return await ipcRenderer.invoke("get-key", keyName)
}

function setKey(keyName, keyValue) {
    let data = {
        keyName: keyName,
        keyValue: keyValue
    }
    console.log("Key will be saved", data)
    ipcRenderer.send("set-key", data)
}