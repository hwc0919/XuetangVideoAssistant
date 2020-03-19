if (!window.xtAssistBtn) {
    window.xtAssistBtn = createXtAssistBtn();
}
if (!window.domObserver) {
    window.domObserver = new DomObserver();
}
if (!window.xtAssistSettings) {
    window.xtAssistSettings = loadXtAssistSettings();
}
if (!window.xtAssistEnableFlag) {
    window.xtAssistEnableFlag = true;
}


function loadXtAssistSettings() {
    return {
        playbackRate: 1.0,
    }
}


function createXtAssistBtn() {

    // Previous Button
    let prev = document.createElement('button');
    prev.className = "xt-assist-btn-prev"
    prev.innerText = "<<";
    prev.style.height = "26px";
    prev.style.width = "40px";
    prev.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    prev.style.borderTopLeftRadius = "5px";
    prev.style.borderBottomLeftRadius = "5px";

    prev.addEventListener('click', function () {
        changeVideoSrc(-1);
    });

    // Next Button
    let next = document.createElement('button');
    next.className = "xt-assist-btn-next"
    next.innerText = ">>";
    next.style.height = "26px";
    next.style.width = "40px";
    next.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    next.style.borderTopRightRadius = "5px";
    next.style.borderBottomRightRadius = "5px";

    next.addEventListener('click', function () {
        changeVideoSrc(1);
    });

    // Button Group
    let btnGroup = document.createElement('div')
    btnGroup.id = "xt-assist-btn";
    btnGroup.appendChild(prev);
    btnGroup.appendChild(next);

    let btnGroupStyle = {
        height: "26px",
        display: "flex",
        justifyContent: "center",
        flexWrap: "nowrap",
        position: "absolute",
        left: "180px",
        top: "50%",
        transform: "translateY(-50%)",
        fontColor: "black",
        fontWeight: "bold",
    }

    Object.keys(btnGroupStyle).forEach((e) => {
        btnGroup.style[e] = btnGroupStyle[e];
    })

    return btnGroup;
}


// Class DomObserver
function DomObserver() {
    this.element = document.getElementsByClassName('lesson_rightcon')[0];
    this.options = { childList: true, subtree: true };
    this.autoSwithLock = false;
    this.played = false;   // Auto switch part only if the video has ever been played.

    this.callback = function (mutationsList, obs) {
        for (let record of mutationsList) {
            if (record.type == 'childList' &&
                record.target.tagName.toLowerCase() == 'xt-fullscreenbutton') {
                // Caution: Sometimes auto fullscreen would fail with a warning:
                // `API can only be initiated by a user gesture.`
                if (!record.target.classList.contains('xt_video_player_fullscreen_cancel'))
                    chrome.storage.local.get('autoFullscreen', function (result) {
                        if (result.autoFullscreen) { record.target.click(); }
                    });

                // Insert xtAssistBtn again, if not exists
                insertXtAssistBtn();
                this.played = false;

                // Recover video speed
                let video = document.getElementsByTagName('video')[0];
                if (video) {
                    let onPlayHandler = function () {
                        this.playbackRate = xtAssistSettings.playbackRate;
                        this.removeEventListener('play', onPlayHandler);
                    };
                    video.addEventListener('play', onPlayHandler);
                    video.addEventListener('ended', () => {
                        console.log(this.played);
                        if (!this.played) return;
                        chrome.storage.local.get('autoSwitchpart', (res) => {
                            if (res.autoSwitchpart) { setTimeout(() => { changeVideoSrc(1); }, 2000); }
                        })
                    })
                }
                return;
            } else if (record.type == 'childList' && record.target.className == 'white') {
                // Set `this.played` to true if ever: curTime != totalTime
                let curTimeSpan = record.target;
                let totalTime = curTimeSpan.nextElementSibling.innerText;
                if (curTimeSpan.innerText != totalTime) this.played = true;
            } // end if
        }; // end callback
    }

    this.observer = new MutationObserver(this.callback);

    this.observe = function () {
        this.observer.observe(this.element, this.options);
    };

    this.disconnect = function () {
        this.observer.disconnect();
    };
}


// Class FlashBox
function FlashBox() {
    this.flashDiv = document.createElement('div');

    let flashDivStyle = {
        paddingLeft: "50px",
        paddingRight: "50px",
        height: "40px",
        lineHeight: "40px",
        fontSize: "20px",
        textAlign: "center",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        background: "rgb(255, 255, 255)",
        border: "1px solid gray",
        borderRadius: "5px",
        opacity: 0,
        transitionDuration: "0.5s"
    };

    Object.keys(flashDivStyle).forEach((e) => {
        this.flashDiv.style[e] = flashDivStyle[e];
    });

    this.flash = function (message, time = 1000) {
        this.flashDiv.innerText = message;
        document.getElementsByTagName('body')[0].appendChild(this.flashDiv);

        // FadeIn
        let v = 0;
        let top = 80;
        let timer = setInterval(() => {
            if (v < 0.8) {
                v += 0.1;
                top += 1;
                this.flashDiv.style.opacity = v;
                this.flashDiv.style.top = top + "px";
            } else {
                clearInterval(timer);
            }
        }, 10);
        setTimeout(() => {
            document.getElementsByTagName('body')[0].removeChild(this.flashDiv);
        }, time);
    }
}


function flash(message, time) {
    new FlashBox().flash(message, time);
}


function changeVideoSrc(direction) {
    let spans = document.getElementsByClassName("noScore");
    let ind;
    for (let i = 0; i < spans.length; i++) {
        if (spans[i].parentNode.classList.contains("active")) {
            ind = i; break;
        }
    }
    // Record settings
    let video = document.getElementsByTagName('video')[0];
    if (video) xtAssistSettings.playbackRate = video.playbackRate;

    spans[ind + direction].click();
}


function insertXtAssistBtn() {
    if (document.getElementById('xt-assist-btn')) return true;
    let v = document.getElementsByTagName('xt-inner')[0]
    if (v) {
        v.appendChild(xtAssistBtn);
        return true;
    }
    return false;
}


function init() {
    if (!window.domObserver.element) {
        flash("开启失败, 不在课程页面");
        return;
    }
    try {
        domObserver.observe();
        insertXtAssistBtn();
        flash("开启成功");
    } catch (err) {
        flash("开启失败");
    }
}

init();