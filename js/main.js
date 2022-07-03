let vh = window.innerHeight;
let vw = window.innerWidth;
let delay = 10; //更新時間(mS)
let speed = 10; //下落速度(px)
let timeLine = 0;   //時間軸(mS)
let checkLine, range;
let score = 0;  //分數
let keyMap = {  //物理鍵位
    'ArrowLeft': 0,
    'ArrowDown': 1,
    'ArrowRight': 2,
}
let totalBalls = 0; //音球總數
let ballSpectrum, lineSpectrum;   //譜

// 初始化
window.onload = () => {
    // 讀取譜面
    fetch("../json/spectrum.json")
        .then(response => {
            return response.json();
        })
        .then((ret) => {
            ballSpectrum = ret.ballSpectrum;
            lineSpectrum = ret.lineSpectrum;
            for (var i in ballSpectrum) {
                totalBalls += Object.keys(ballSpectrum[i]).length;
            }
        });

    checkLine = document.getElementById('controller').offsetHeight - (document.getElementsByClassName('check-point')[0].offsetHeight / 2);
    range = document.getElementsByClassName('check-point')[0].offsetHeight;
    
    window.setInterval(drop, delay);

    document.addEventListener('keydown', (event) => {
        if (keyMap[event.code] != undefined) {
            showCheckEffect(keyMap[event.code])
            checkBallPosition(keyMap[event.code]);
        }
    })


}

// 下落控制
function drop() {
    dropBall();
    dropLine();
    createBall();
    createLine();
    timeLine += delay;
}

function dropBall(){
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
}

function dropLine(){
    var lines = document.getElementsByClassName('line');    
    for (var key = 0; key < lines.length; key++) {
        var position = getPosition(lines[key]);
        if (position.y - (lines[key].offsetHeight / 2) + speed < vh) {
            lines[key].style.transform = `translateY(${position.y + speed}px)`;
            // console.log(getPosition(lines[key]))
            continue;
        }
        if (position.y + lines[key].offsetHeight + speed >= vh) {
            lines[key].remove();
            showCheckLevel(100);
        }
    }
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
    for (var track in ballSpectrum) {
        if (ballSpectrum[track][timeLine]) {
            var ball = document.createElement('div');
            ball.classList.add('ball');
            ball.style.transform = `translateY(${range / -2}px)`;
            document.getElementById(`track${track}`).append(ball);
        }
    }
}

// 依時間軸生成音條
function createLine() {
    for (var track in lineSpectrum) {
        if (lineSpectrum[track][0][timeLine]) {
            var line = document.createElement('div');
            var height = ((lineSpectrum[track][1][timeLine] - timeLine) / delay) * speed;
            line.classList.add('line');
            line.style.height = `${height}px`;
            line.style.transform = `translateY(${height / -2}px)`;
            line.innerHTML = '<div class="line-ball-start"></div><div class="line-ball-end"></div>'
            document.getElementById(`track${track}`).append(line);
        }
    }
}

// 確認音球位置是否在判定區
function checkBallPosition(track) {
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
    } else if (check <= range) {
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