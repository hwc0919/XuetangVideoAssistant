if (window.xtAssistBtn) {
    window.xtAssistBtn.remove();
}

if (window.domObserver) {
    window.domObserver.disconnect();
    delete window.domObserver;
}

flash('关闭成功');
