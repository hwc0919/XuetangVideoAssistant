window.xtAssistEnableFlag = false;

if (window.xtAssistBtn) {
    window.xtAssistBtn.remove();
}

if (window.domObserver) {
    window.domObserver.disconnect();
}

flash('关闭成功');
