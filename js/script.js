var socket = io.connect('http://localhost:5000');
var audioData = [];

socket.on('audio_data', function (data) {
    audioData = data.map(function (val) {
        return val / 16348; // Normalize audio data to range -1 to 1
    });
});

var addImg = function () {
    fetch('http://localhost:5000/random-image')
        .then(response => response.json())
        .then(data => {
            if (data.image) {
                let imgElement = $('<img src="http://localhost:5000/images/' + data.image + '" class="active">');
                $('#slideshow').html(imgElement); // Replace current images with new random image
            } else {
                alert('No images found.');
            }
        })
        .catch(error => {
            console.error('Error fetching the random image:', error);
        });
};

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

var w, h, minW;
var show = document.querySelector("#show");

function showi(str) {
    show.innerHTML = str;
}

var oClock = document.querySelector("#clock");
var tStyle = true;

function getTime() {
    var t = new Date();

    var a = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var week = new Date().getDay();
    var str4 = a[week];

    var b = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var month = new Date().getMonth();
    var str5 = b[month];

    if (tStyle) {
        oClock.innerHTML = add0(t.getHours()) + ":" + add0(t.getMinutes()) + "<span class='sec'>" + ":" + add0(t.getSeconds()) +
            "</span>" + "</br>" + "<div id='DayNight'>" + str4 + "</div>";
    } else {
        var h = t.getHours();
        var str = h < 12 ? "AM" : "PM";
        h = h <= 12 ? h : h - 12;
        oClock.innerHTML = "<span id='time'>" + add0(h) + " : " + add0(t.getMinutes()) + " <span class='sec'>" + add0(t.getSeconds()) +
            "</span><span class='st'>" + str + "</span>" + str4 + "</span>";
    }
}

function autoTime() {
    getTime();
    setTimeout(autoTime, 1000);
}

function add0(n) {
    return n < 10 ? '0' + n : '' + n;
}
autoTime();

var param = {
    style: 1, 
    r: 0.5, 
    color: "rgba(255,255,255,0.8)",
    blurColor: "yellow", 
    arr1: [], 
    arr2: [], 
    rotation: 2, 
    offsetAngle: 0, 
    arr: [],
    waveArr: new Array(120),
    cX: 0.5, 
    cY: 0.5,
    tX: 50, 
    tY: 50,
    range: 1, 
    shadowBlur: 15,
    lineWidth: 3,
    showCircle: true,
    isBlur: true,
    timeNum: 5,
    };


var can = document.querySelector("#can");
var ctx = can.getContext("2d");

function resize() {
    can.width = w = window.innerWidth;
    can.height = h = window.innerHeight;
    minW = Math.min(w, h);
    oClock.style.width = w + 'px';
    oClock.style.height = oClock.style.lineHeight = h + 'px';
    setCan();
}
resize();
oClock.style.fontSize = Math.floor(h / 300 * 20) + 'px';
window.onresize = resize;

function setCan() {
    if (param.color !== null) {
        oClock.style.color = ctx.strokeStyle = param.color;
    }
    if (param.lineWidth !== null) {
        ctx.lineWidth = param.lineWidth;
    }
    if (param.isBlur !== null) {
        ctx.shadowBlur = param.isBlur ? param.shadowBlur : 0;
        ctx.shadowColor = param.blurColor;
        oClock.style.textShadow = param.isBlur ? '0 0 20px ' + param.blurColor : 'none';
    }
}

addImg();

// Function to manually update properties
function updateProperties(properties) {
    if (properties.style !== undefined) {
        param.style = properties.style;
    }
    if (properties.radius !== undefined) {
        param.r = properties.radius / 100;
    }
    if (properties.range !== undefined) {
        param.range = properties.range / 5;
    }
    if (properties.color !== undefined) {
        var c = properties.color.split(' ').map(function (c) {
            return Math.ceil(c * 255);
        });
        param.color = 'rgba(' + c + ',0.8)';
        setCan();
    }
    if (properties.blurColor !== undefined) {
        var c = properties.blurColor.split(' ').map(function (c) {
            return Math.ceil(c * 255);
        });
        param.blurColor = 'rgb(' + c + ')';
        setCan();
    }
    if (properties.showTime !== undefined) {
        oClock.style.display = properties.showTime ? 'block' : 'none';
    }
    if (properties.cX !== undefined) {
        param.cX = properties.cX * 0.01;
    }
    if (properties.cY !== undefined) {
        param.cY = properties.cY * 0.01;
    }
    if (properties.tX !== undefined) {
        param.tX = properties.tX;
        oClock.style.left = param.tX - 50 + '%';
    }
    if (properties.tY !== undefined) {
        param.tY = properties.tY;
        oClock.style.top = param.tY - 50 + '%';
    }
    if (properties.tSize !== undefined) {
        var s = properties.tSize;
        oClock.style.fontSize = Math.floor(h / 300 * s) + 'px';
    }
    if (properties.tStyle !== undefined) {
        tStyle = properties.tStyle;
        getTime();
    }
    if (properties.rotation !== undefined) {
        param.rotation = properties.rotation;
    }
    if (properties.lineWidth !== undefined) {
        ctx.lineWidth = param.lineWidth = properties.lineWidth;
    }
    if (properties.showCircle !== undefined) {
        param.showCircle = properties.showCircle;
    }
    if (properties.isBlur !== undefined) {
        param.isBlur = properties.isBlur;
        setCan();
    }
    if (properties.timeNum !== undefined) {
        param.timeNum = properties.timeNum * 1000;
        console.log("Setting timeNum to:", param.timeNum);

        // Clear any existing interval to avoid multiple intervals running
        if (window.slideon) {
            clearInterval(window.slideon);
        }

        window.slideon = setInterval(function changeSlide() {
            addImg(); // Load a new random image
        }, param.timeNum);
    }
}

updateProperties({
    style: 1,
    radius: 50,
    range: 2,
    color: "(255,255,255,0.8)",
    blurColor: "yellow",
    showTime: true,
    cX: 50,
    cY: 60,
    tX: 50,
    tY: 61,
    tSize: 15,
    tStyle: true,
    rotation: 2,
    lineWidth: 3,
    showCircle: true,
    isBlur: true,
    timeNum: 60
});

function createPoint(arr) {
    param.arr1 = [];
    param.arr2 = [];
    for (var i = 0; i < 120; i++) {
        var deg = Math.PI / 180 * (i + param.offsetAngle) * 3;
        var w1 = arr[i] ? arr[i] : 0;
        var w2;
        if (param.waveArr[i]) {
            w2 = param.waveArr[i] - 0.1;
        } else {
            w2 = 0;
        }
        w1 = Math.max(w1, w2);
        param.waveArr[i] = w1 = Math.min(w1, 1.2);
        var w = w1 * param.range * 100;
        var offset1 = param.r * minW / 2 + w + 1;
        var offset2 = param.r * minW / 2 - w - 1;
        var p1 = getXY(offset1, deg);
        var p2 = getXY(offset2, deg);
        param.arr1.push({
            'x': p1.x,
            'y': p1.y
        });
        param.arr2.push({
            'x': p2.x,
            'y': p2.y
        });
    }
    if (param.rotation) {
        param.offsetAngle += param.rotation / 100;
        if (param.offsetAngle >= 360) {
            param.offsetAngle = 0;
        } else if (param.offsetAngle <= 0) {
            param.offsetAngle = 360;
        }
    }
}

function getXY(offset, deg) {
    return {
        'x': Math.cos(deg) * offset + param.cX * w,
        'y': Math.sin(deg) * offset + param.cY * h
    };
}
createPoint([]);

function style1() {
    ctx.beginPath();
    ctx.moveTo(param.arr1[0].x, param.arr1[0].y);
    for (var i = 0; i < 120; i++) {
        ctx.lineTo(param.arr1[i].x, param.arr1[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(param.arr2[0].x, param.arr2[0].y);
    for (var i = 0; i < 120; i++) {
        ctx.lineTo(param.arr2[i].x, param.arr2[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    for (var i = 0; i < 120; i++) {
        ctx.moveTo(param.arr1[i].x, param.arr1[i].y);
        ctx.lineTo(param.arr2[i].x, param.arr2[i].y);
    }
    ctx.closePath();
    ctx.stroke();
}

function style2() {
    ctx.beginPath();
    for (var i = 0; i < 120; i++) {
        ctx.moveTo(param.arr1[i].x, param.arr1[i].y);
        ctx.lineTo(param.arr2[i].x, param.arr2[i].y);
    }
    ctx.closePath();
    ctx.stroke();
}
style1();

function auto() {
    ctx.clearRect(0, 0, w, h);
    createPoint(audioData);
    if (param.showCircle) {
        switch (param.style) {
            case 1:
                style1();
                break;
            case 2:
                style2();
                break;
        }
    }
    requestAnimFrame(auto);
}
auto();
