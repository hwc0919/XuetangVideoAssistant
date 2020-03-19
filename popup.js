let enableCheckbox = document.getElementById('enable-checkbox');
let autoFullscreen = document.getElementById('auto-fullscreen');

// Check enable state
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(tabs[0].id, {
        code: `if (!window.domObserver) chrome.storage.local.set({ enabled: false });`
    }, () => {
        chrome.storage.local.get(['enabled'], function (result) {
            enableCheckbox.checked = result.enabled || false;
        });
    })
});

chrome.storage.local.get(['autoFullscreen'], function (result) {
    autoFullscreen.checked = result.autoFullscreen || false;
});

// Event Listener for checkbox
enableCheckbox.onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (enableCheckbox.checked) {
            chrome.storage.local.set({ enabled: true });
            chrome.tabs.executeScript(tabs[0].id, { file: "./enable.js" })
        } else {
            chrome.storage.local.set({ enabled: false });
            chrome.tabs.executeScript(tabs[0].id, { file: "./disable.js" })
        }
    });
}

autoFullscreen.onclick = function () {
    if (autoFullscreen.checked) {
        chrome.storage.local.set({ autoFullscreen: true });
    } else {
        chrome.storage.local.set({ autoFullscreen: false });
    }
}