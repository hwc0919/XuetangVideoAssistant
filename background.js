'use strict';

chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.set({
        enabled: false,
        autoFullscreen: true,
        autoSwitchpart: true
    }, function () {
        console.log("Default: Disable.");
    });

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostEquals: 'next.xuetangx.com' }
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});