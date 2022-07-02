let vh = window.innerHeight;
let vw = window.innerWidth;
let delay = 10; //更新時間(mS)
let speed = 15; //下落速度(px)
let timeLine = 0;   //時間軸(mS)
let checkLine, range;
let score = 0;  //分數
let keyMap = {  //物理鍵位
    'ArrowLeft': 0,
    'ArrowDown': 1,
    'ArrowRight': 2,
}
let totalBalls = 0; //音球總數
let spectrum = [    //譜
    track0 = {
        500: true,
        2000: true,
        3500: true,
    },
    track1 = {
        1000: true,
        2500: true,
    },
    track2 = {
        1500: true,
        3000: true,
        3500: true,
    }
]

// 初始化
window.onload = () => {
    checkLine = document.getElementById('controller').offsetHeight - (document.getElementsByClassName('check-point')[0].offsetHeight / 2);
    range = document.getElementsByClassName('check-point')[0].offsetHeight;
    for(var i in spectrum){
        for(var j in spectrum[i]){
            totalBalls++;
        }
    }
    window.setInterval(dropBall, delay);
    document.addEventListener('keydown', (event) => {
        if (keyMap[event.code] != undefined) {
            showCheckEffect(keyMap[event.code])
            checkPosition(keyMap[event.code]);
        }
    })
}

// 音球下落控制
function dropBall() {
    var balls = document.getElementsByClassName('ball');
    for (var key = 0; key < balls.length; key++) {
        var position = getPosition(balls[key]);
        if (position.y + (balls[key].offsetHeight / 2) + speed < vh) {
            balls[key].style.transform = `translateY(${position.y + speed}px)`;
            continue;
        }
        if (position.y + balls[key].offsetHeight + speed >= vh) {
            balls[key].remove();
            showCheckLevel(100);
        }
    }
    createBall();
}

// 取得物件位置
function getPosition(element) {
    var curTransform = new WebKitCSSMatrix(window.getComputedStyle(element).transform);
    // var x = element.offsetLeft + curTransform.m41;
    var y = curTransform.m42;
    return { y: y };
}

// 依時間軸生成音球
function createBall() {
    for(var track in spectrum){
        if (spectrum[track][timeLine]) {
            var ball = document.createElement('div');
            ball.classList.add('ball');
            document.getElementById(`track${track}`).append(ball);
        }
    }
    timeLine += delay;
}

// 確認音球位置是否在判定區
function checkPosition(track) {
    var balls = document.getElementById(`track${track}`).children;
    if (balls.length > 0) {
        var position = getPosition(balls[0]);
        var y = position.y;
        if (y >= checkLine - range * 2 && y <= checkLine + range * 2) {
            balls[0].remove();
            showCheckLevel(checkLine - y);
        }
    }
}

// 按鍵動畫
function showCheckEffect(key) {
    var checkAreas = document.getElementsByClassName('check-effect');
    checkAreas[key].classList.remove('check-effect-anime');
    checkAreas[key].offsetHeight = checkAreas[0].offsetHeight;
    checkAreas[key].classList.add('check-effect-anime');
}

// 音球判定
function showCheckLevel(check) {
    console.log(Math.abs(check))
    check = Math.abs(check);
    var show = document.getElementsByClassName('check-level')[0];
    var scoreBar = document.getElementById('scoreBar');
    var scoreNum = document.getElementById('score');
    if (check <= range * 0.3) {
        show.innerText = "PERFACT";
        show.style = 'background: var(--perfact); -webkit-background-clip: text;';
        score++;
    } else if (check <= range * 0.7) {
        show.innerText = "GREAT";
        show.style = 'background: var(--great); -webkit-background-clip: text;';
        score += 0.6;
    }else if(check <= range){
        show.innerText = "NICE";
        show.style = 'background: var(--nice); -webkit-background-clip: text;';
        score += 0.2;
    } else if (check > range) {
        show.innerText = "MISS";
        show.style = 'background: var(--miss); -webkit-background-clip: text;';
    }
    show.classList.remove('check-level-effect-anime');
    show.offsetHeight = show.offsetHeight;
    show.classList.add('check-level-effect-anime');
    var percent = (score / totalBalls) * 100;
    scoreBar.style.height = `${percent}%`;
    scoreNum.innerText = `${Math.round(percent)}%`;
}