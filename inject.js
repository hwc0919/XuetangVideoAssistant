if (!window.xtAssistBtn) {
    window.xtAssistBtn = createXtAssistBtn();
}
if (!window.domObserver) {
    window.domObserver = new DomObserver();
}
if (!window.flashBox) {
    window.flashBox = new FlashBox();
}
if (!window.xtAssistSettings) {
    window.xtAssistSettings = loadXtAssistSettings();
}

function loadXtAssistSettings() {
    return {
        playbackRate: 1.0,
    }
}


function createXtAssistBtn() {

    // Previous Button
    let prev = document.createElement('button');
    prev.className = "xt-helper-btn-prev"
    prev.innerText = "<<";
    prev.style.height = "30px";
    prev.style.width = "30px";

    prev.addEventListener('click', function () {
        var spans = document.getElementsByClassName("noScore");
        var ind;
        for (let i = 0; i < spans.length; i++) {
            if (spans[i].parentNode.classList.contains("active")) {
                ind = i; break;
            }
        }
        // Record settings
        let video = document.getElementsByTagName('video')[0];
        if (video) xtAssistSettings.playbackRate = video.playbackRate;

        spans[--ind].click();
    });


    // Next Button
    let next = document.createElement('button');
    next.className = "xt-helper-btn-next"
    next.innerText = ">>";
    next.style.height = "30px";
    next.style.width = "30px";
    next.addEventListener('click', async function () {
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

        spans[++ind].click();
    });

    // Button Group
    let btnGroup = document.createElement('div')
    btnGroup.id = "xt-helper-btn";
    btnGroup.appendChild(prev);
    btnGroup.appendChild(next);

    let btnGroupStyle = {
        height: "30px",
        width: "80px",
        display: "flex",
        position: "absolute",
        right: "30px",
        top: "10px",
        transform: "translateX(-50%)",
        opacity: 0.5,
        zIndex: 100
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
    this.reload = false;

    this.callback = function (mutationsList, obs) {
        for (let i in mutationsList) {
            let record = mutationsList[i];
            if (record.type == 'childList' &&
                record.target.className == 'xt_video_player_fullscreen fr') {

                record.target.click();
                let v = document.getElementById('xt-helper-btn');
                let video = document.getElementsByTagName('video')[0];
                if (!v && video) {
                    video.parentNode.insertBefore(xtAssistBtn, video);
                }
                if (video) {
                    let handler = function () {
                        this.playbackRate = xtAssistSettings.playbackRate;
                        this.removeEventListener('play', handler);
                    };
                    video.addEventListener('play', handler);
                }
            }
        }
    };

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
        height: "50px",
        lineHeight: "50px",
        fontSize: "26px",
        textAlign: "center",
        position: "absolute",
        top: "100px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        background: "rgb(255, 255, 255)",
        border: "1px solid gray",
        borderRadius: "5px"
    }

    Object.keys(flashDivStyle).forEach((e) => {
        this.flashDiv.style[e] = flashDivStyle[e];
    });

    this.flash = function (message, time = 1000) {
        this.flashDiv.innerText = message;
        document.getElementsByTagName('body')[0].appendChild(this.flashDiv);
        setTimeout(() => {
            document.getElementsByTagName('body')[0].removeChild(this.flashDiv);
        }, time);
    }
}

function insertXtAssistBtn() {
    if (document.getElementById('xt-helper-btn')) return true;
    let v = document.getElementsByTagName('video')[0]
    if (v) {
        v.parentNode.insertBefore(xtAssistBtn, v);
        return true;
    }
    return false;
}

function init() {
    try {
        domObserver.observe();
        insertXtAssistBtn();
        flashBox.flash("开启成功");
    } catch (err) {
        flashBox.flash("失败" + err.toString());
    }
}

init();