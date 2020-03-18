let enableBtn = document.getElementById('enable-xt-helper');

enableBtn.onclick = function (element) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.executeScript(
            tabs[0].id,
            {
                file: "./inject.js"
            })
    });
};

