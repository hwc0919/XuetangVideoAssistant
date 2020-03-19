function checkEnable() {
    if (!window.domObserver || !window.domObserver.element)
        return false;

    let body = document.getElementsByTagName('body')[0];
    if (!body.contains(window.domObserver.element))
        return false;

    return true;
}

chrome.storage.local.set({ enabled: checkEnable() });