if (!window.xtAssistBtn) {
    window.xtAssistBtn = createXtAssistBtn();
}
if (!window.domObserver || !window.domObserver.element) {
    window.domObserver = new DomObserver();
}
if (!window.xtAssistSettings) {
    window.xtAssistSettings = loadXtAssistSettings();
}

window.allTitles = document.getElementsByClassName("titlespan noScore");

Object.values(window.allTitles).forEach((title) => {
    if (!title.onclick) title.onclick = function () {
        let v = document.getElementsByTagName('video')[0];
        if (v) xtAssistSettings.playbackRate = v.playbackRate;
    }
})


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
    prev.title = "上一集";
    prev.style.height = "26px";
    prev.style.lineHeight = "24px";
    prev.style.width = "40px";
    prev.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    prev.style.borderTopLeftRadius = "5px";
    prev.style.borderBottomLeftRadius = "5px";

    prev.onclick = function () { changeVideoSrc(-1); };

    // Next Button
    let next = document.createElement('button');
    next.className = "xt-assist-btn-next"
    next.innerText = ">>";
    next.title = "下一集";
    next.style.height = "26px";
    next.style.lineHeight = "24px";
    next.style.width = "40px";
    next.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    next.style.borderTopRightRadius = "5px";
    next.style.borderBottomRightRadius = "5px";

    next.onclick = function () { changeVideoSrc(1); };

    // Picture in Picture
    let picInPic = document.createElement('button');
    picInPic.className = "xt-assist-btn-picinpic"
    picInPic.innerText = "O";
    picInPic.title = "小窗模式";
    picInPic.style.height = "26px";
    picInPic.style.lineHeight = "24px";
    picInPic.style.width = "25px";
    picInPic.style.backgroundColor = "rgba(255, 255, 255, 0.1)";

    picInPic.onclick = function () {
        let video = document.getElementsByTagName('video')[0];
        if (video) video.requestPictureInPicture();
    };

    // Button Group
    let btnGroup = document.createElement('div')
    btnGroup.id = "xt-assist-btn";
    btnGroup.appendChild(prev);
    btnGroup.appendChild(picInPic);
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
    let that = this;

    this.callback = function (mutationsList, obs) {
        for (let record of mutationsList) {
            if (record.type == 'childList' &&
                record.target.tagName.toLowerCase() == 'xt-fullscreenbutton') {

                // Insert xtAssistBtn again, if not exists
                insertXtAssistBtn();
                that.played = false;

                // Fullscreen
                // Caution: Sometimes auto fullscreen would fail with a warning:
                // `API can only be initiated by a user gesture.`
                chrome.storage.local.get('autoFullscreen', function (result) {
                    if (result.autoFullscreen) {
                        setFullscreen();
                        if (!record.target.classList.contains('xt_video_player_fullscreen_cancel'))
                            flash("网页限制, 自动全屏失败", 3000);
                    }
                });

                // Recover video speed
                let video = document.getElementsByTagName('video')[0];
                if (video) {
                    video.onplay = function () {

                        video.onplay = null;
                        setTimeout(() => { // Make compatible to `VideoSpeedController Extension`
                            video.playbackRate = xtAssistSettings.playbackRate;
                        }, 200);
                    };
                    video.onended = function () {
                        if (!that.played) {
                            video.currentTime = 0;  // Restart if already reach end
                            video.play();
                            return;
                        }
                        chrome.storage.local.get('autoSwitchpart', (res) => {
                            if (res.autoSwitchpart) { setTimeout(() => { changeVideoSrc(1); }, 2000); }
                        })
                    };
                } else flash("No video on page!")
                return;
            } else if (record.type == 'childList' && record.target.className == 'white') {
                // Set `this.played` to true if ever: curTime != totalTime
                let curTimeSpan = record.target;
                let totalTime = curTimeSpan.nextElementSibling.innerText;
                if (curTimeSpan.innerText != totalTime) that.played = true;
            }  // end if
        };  // end for
    }  // end callback

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
        border: "1px solid red",
        borderRadius: "5px",
        opacity: 0,
        transitionDuration: "0.5s"
    };

    Object.keys(flashDivStyle).forEach((e) => {
        this.flashDiv.style[e] = flashDivStyle[e];
    });

    this.flash = function (message, time) {
        this.flashDiv.innerText = message;
        document.getElementsByTagName('body')[0].appendChild(this.flashDiv);

        // FadeIn
        let v = 0;
        let top = 80;
        let timer = setInterval(() => {
            if (v < 0.8) {
                v += 0.1;
                top += 2;
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


function flash(message, time = 1000) {
    new FlashBox().flash(message, time);
}


function changeVideoSrc(direction) {
    if (!window.allTitles || !allTitles.length)
        window.allTitles = document.getElementsByClassName("titlespan noScore");

    let ind;
    for (let i = 0; i < allTitles.length; i++) {
        if (allTitles[i].parentNode.classList.contains("active")) {
            ind = i; break;
        }
    }
    if (ind + direction < 0 || ind + direction >= allTitles.length) {
        quitFullscreen();
        flash("没有了!");
        return;
    }
    // Record settings
    let video = document.getElementsByTagName('video')[0];
    if (video) xtAssistSettings.playbackRate = video.playbackRate;

    allTitles[ind + direction].click();
}


function setFullscreen() {
    let fullscreenBtn = document.getElementsByTagName('xt-fullscreenbutton')[0];
    if (fullscreenBtn && !fullscreenBtn.classList.contains('xt_video_player_fullscreen_cancel')) {
        fullscreenBtn.click(); return true;
    }
    return false;
}


function quitFullscreen() {
    let fullscreenBtn = document.getElementsByTagName('xt-fullscreenbutton')[0];
    if (fullscreenBtn && fullscreenBtn.classList.contains('xt_video_player_fullscreen_cancel')) {
        fullscreenBtn.click(); return true;
    }
    return false;
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
        delete window.domObserver;
        return;
    }
    try {
        domObserver.observe();
        insertXtAssistBtn();
        let video = document.getElementsByTagName('video')[0];
        if (video && !video.onended)
            video.onended = function () {
                chrome.storage.local.get('autoSwitchpart', (res) => {
                    if (res.autoSwitchpart) { setTimeout(() => { changeVideoSrc(1); }, 1000); }
                })
            };
        flash("开启成功");
    } catch (err) {
        flash("开启失败");
    }
}

init();