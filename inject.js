(function init() {
    let prev = document.createElement('button');
    prev.className = "xt-helper-btn-prev"
    prev.innerText = "<<";
    prev.style.height = "20px";
    prev.style.width = "30px";

    prev.addEventListener('click', function () {
        var spans = document.getElementsByClassName("noScore");
        var ind;
        for (let i = 0; i < spans.length; i++) {
            if (spans[i].parentNode.classList.contains("active")) {
                ind = i; break;
            }
        }
        spans[--ind].click();
    });

    let next = document.createElement('button');
    next.className = "xt-helper-btn-next"
    next.innerText = ">>";
    next.style.height = "20px";
    next.style.width = "30px";
    next.addEventListener('click', function () {
        let spans = document.getElementsByClassName("noScore");
        let ind;
        for (let i = 0; i < spans.length; i++) {
            if (spans[i].parentNode.classList.contains("active")) {
                ind = i; break;
            }
        }
        spans[++ind].click();
    });

    let btnGroup = document.createElement('div')
    btnGroup.id = "xt-helper-btn";
    btnGroup.appendChild(prev);
    btnGroup.appendChild(next);

    let btnGroupStyle = {
        height: "20px",
        width: "80px",
        display: "flex",
        position: "absolute",
        left: "50%",
        top: "10px",
        transform: "translateX(-50%)",
        opacity: 0.5,
        zIndex: 100
    }

    Object.keys(btnGroupStyle).forEach((e) => {
        btnGroup.style[e] = btnGroupStyle[e];
    })

    let targetNode = document.getElementsByClassName('lesson_rightcon')[0];//content监听的元素id
    //options：监听的属性
    let options = { childList: true, subtree: true };
    //回调事件
    function callback(mutationsList, observer) {
        for (let i in mutationsList) {
            let record = mutationsList[i];
            if (record.type == 'childList' &&
                record.target.className == 'xt_video_player_fullscreen fr') {
                record.target.click();
                v = document.getElementById('btn-group');
                if (!v) {
                    try {
                        v = document.getElementsByTagName('video')[0]
                        v.parentNode.insertBefore(btnGroup, v);
                    } catch (err) {
                    }
                }
                return;
            }
        }
    }
    let mutationObserver = new MutationObserver(callback);
    mutationObserver.observe(targetNode, options);


    function insertXtHelperBtn() {
        if (document.getElementById('xt-helper-btn')) return false;
        let v = document.getElementsByTagName('video')[0]
        if (v)
            v.parentNode.insertBefore(btnGroup, v);
    }

    insertXtHelperBtn();

    let flash = document.createElement('div');
    flash.innerText = "开启成功";

    let flashStyle = {
        width: "200px",
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

    Object.keys(flashStyle).forEach((e) => {
        flash.style[e] = flashStyle[e];
    })

    document.getElementsByTagName('body')[0].appendChild(flash);
    setTimeout(() => {
        document.getElementsByTagName('body')[0].removeChild(flash);
    }, 1000);
})();

