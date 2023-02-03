const webviewModal = new bootstrap.Modal($("#webviewModal"))

window.datareader.getNewsData()

setInterval(() => {
    let now = new Date()
    if (now.getHours() < 10) {
        $("#main-clock").innerText = now.getHours() + " : 0" + now.getMinutes()
    } else {
        $("#main-clock").innerText = now.getHours() + " : " + now.getMinutes()
    }
    $("#main-date").innerText = now.getFullYear() + " / " + (now.getMonth() + 1).toString() + " / " + now.getDate()
}, 500);


function openAtWebview(source) {
    $("#webviewModalWebview").src = source
    webviewModal.show()
}

function $(query) {
    return document.querySelector(query)
}