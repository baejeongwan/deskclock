const webviewModal = new bootstrap.Modal($("#webviewModal"))
const settingsModal = new bootstrap.Modal($("#settingsModal"))
const appOffcanvas = new bootstrap.Offcanvas($("#appOffcanvas"))

const apps = [
    {
        "appId": "settings",
        "modalObj": settingsModal,
        "displayName": `<i class="bi bi-gear-fill"></i> Settings`
    }
]

window.datareader.getNewsData()

setInterval(() => {
    let now = new Date()
    if (now.getMinutes() < 10) {
        $("#main-clock").innerText = now.getHours() + " : 0" + now.getMinutes()
    } else {
        $("#main-clock").innerText = now.getHours() + " : " + now.getMinutes()
    }
    $("#main-date").innerText = now.getFullYear() + " / " + (now.getMonth() + 1).toString() + " / " + now.getDate()
}, 500);



function $(query) {
    return document.querySelector(query)
}

//#region Webview

function openAtWebview(source) {
    $("#webviewModalWebview").src = source
    webviewModal.show()
}

$("#webviewModal").addEventListener('hidden.bs.modal', event => {
    $("#webviewModalWebview").src = "about:blank"
})

//#endregion

//#region App Management
loadApps()
function loadApps() {
    $("#appListPanel").innerHTML = "";
    apps.forEach((element, index) => {
        $("#appListPanel").innerHTML += `<button type="button" class="list-group-item list-group-item-action" onclick="openApp(${index})">${element.displayName}</button>`
    })
}

function openApp(idNum) {
    let appToOpen = apps[idNum]
    appOffcanvas.hide()
    appToOpen.modalObj.show()
}

//#endregion