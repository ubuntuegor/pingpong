var main,
    overt,
    dpi,
    canvas = document.getElementById("game"),
    game = canvas.getContext("2d"),
    p1 = 720/2,
    p2 = 720/2,
    ball = {
      "x": 1280/2,
      "y": 720/2, 
      "xv": -1,
      "yv": 0
    },
    p1s = 0,
    p2s = 0,
    sprites = new Image(),
    animations = [],
    sounds = [],
    settings = {},
    hint = "",
    menushown = false;

var overflow = {
	elem: document.querySelector(".overflow"),
	launch: function(text){
		clearTimeout(overt);
		overflow.elem.innerHTML = text;
		overflow.elem.style.display = "flex";
		overflow.elem.style.opacity = "1";
	},
	clear: function (){
		clearTimeout(overt);
		overflow.elem.style.opacity = "0";
		overt = setTimeout(function(){
			overflow.elem.style.display = "none"
		}, 300);
	}
};

window.onload = launch;
window.onresize = setDPI;
canvas.onfullscreenchange = setDPI;

canvas.onmousemove = function(e){
	p1 = (e.clientY-document.querySelector(".container").offsetTop)/dpi;
	if (p1>=720-80) p1 = 720-80;
	if (p1<=80) p1 = 80;
};

canvas.ontouchmove = function(e){
	p1 = (e.changedTouches[0].pageY-document.querySelector(".container").offsetTop)/dpi;
	if (p1>=720-80) p1 = 720-80;
	if (p1<=80) p1 = 80;
	e.preventDefault();
};

document.querySelector(".pause").onclick = pause;
document.querySelector(".fs").onclick = toggleFullscreen;
document.addEventListener("visibilitychange", handleVisibilityChange, false);

document.querySelectorAll("input").forEach(function (elem){
	settings[elem.classList] = elem.checked || parseInt(elem.value);

	elem.onchange = function (){
		settings[this.classList] = this.checked || parseInt(this.value);
		if (this.classList=="music"&&this.checked) sounds.music.volume = 0.2;
		else if (this.classList=="music") sounds.music.volume = 0.0;
	}
});

reset();
overflow.launch("<div><img src='loading.gif'><p>ЗАГРУЗКА...</p></div>");

function launch(){
	sounds.hit1 = new Audio("hit-01.mp3");
	sounds.hit1.oncanplaythrough = function(){
		sounds.hit2 = new Audio("hit-02.mp3");
		sounds.hit2.oncanplaythrough = function(){
			sounds.goal = new Audio("collect-point-01.mp3");
			sounds.goal.oncanplaythrough = function(){
				sounds.music = new Audio("music.mp3");
				sounds.music.loop = true;
				sounds.music.oncanplaythrough = function(){
					sounds.win = new Audio("achievement-01.mp3");
					sounds.win.oncanplaythrough = function(){
						sprites.src = "sprites.png";
						sprites.onload = function(){
							for (var key in sounds) {
								sounds[key].oncanplaythrough = undefined;
							}
							overflow.clear();
							setDPI();
							sounds.music.volume = 0.2;
							sounds.music.play();
							menu();
						};
					};
				};
			};
		};
	};
}

function handleVisibilityChange(){
	if (document.hidden){
		pause();
		sounds.music.pause();
	}
	else{
		sounds.music.play();
	}
}

function setDPI(){
	var w = window.innerWidth, h = window.innerHeight;
	if (h>w) overflow.launch("<div><img src='rotate.gif'><p>ПЕРЕВЕРНИТЕ УСТРОЙСТВО</p></div>");
	else overflow.clear();
	if (w/h>=16/9){
		dpi = h/720;
		canvas.height = h;
		canvas.width = h/9*16;
	}
	else {
		dpi = w/1280;
		canvas.height = w/16*9;
		canvas.width = w;
	}
	pause();
}

function c(c){
	return c*dpi;
}

function soundPlay(sound){
	if (settings.sounds){
		sounds[sound].volume = 0.8;
		sounds[sound].play();
	}
}

function drawLQBG(){
	game.fillStyle = "#D35FFF";
	game.fillRect(0, 0, c(1280), c(720));
	game.strokeStyle = "rgba(0,0,0,0.6)";
	game.setLineDash([c(10),c(15)]);
	game.shadowColor = "rgba(0,0,0,0)";
	game.lineWidth = 2;
	game.beginPath();
	game.moveTo(c(1280/2),0);
	game.lineTo(c(1280/2), c(720));
	game.stroke();
	game.closePath();
}

function drawBG(){
	game.fillStyle = "#D35FFF";
	var bgr = game.createRadialGradient(c(1280/2),c(720/2),c(70),c(1280/2),c(720/2),c(720));
	bgr.addColorStop(0,"#D35FFF");
	bgr.addColorStop(1,"#BD19FF");
	game.fillStyle = bgr;
	game.fillRect(0, 0, c(1280), c(720));
	game.strokeStyle = "rgba(0,0,0,0.6)";
	game.setLineDash([c(10),c(15)]);
	game.shadowColor = "rgba(0,0,0,0)";
	game.lineWidth = 2;
	game.beginPath();
	game.moveTo(c(1280/2),0);
	game.lineTo(c(1280/2), c(720));
	game.stroke();
	game.closePath();
}

function drawLQPlayers(){
	game.shadowColor = "rgba(0,0,0,0.5)";
    game.shadowBlur = 0;
    game.shadowOffsetX = 0;
    game.shadowOffsetY = c(3);
	game.lineCap = "round";
	game.lineWidth = c(20);
	game.setLineDash([]);
	game.strokeStyle = "#000000";
	game.beginPath();
	game.moveTo(c(10), c(p1-80));
	game.lineTo(c(10), c(p1+80));
	game.stroke();
	game.closePath();
	game.beginPath();
	game.moveTo(c(1280-10), c(p2-80));
	game.lineTo(c(1280-10), c(p2+80));
	game.stroke();
	game.closePath();
}

function drawPlayers(){
	game.shadowColor = "rgba(0,0,0,0.5)";
    game.shadowBlur = 0;
    game.shadowOffsetX = 0;
    game.shadowOffsetY = c(3);
	game.drawImage(sprites, 0, 0, 20, 160, 0, c(p1-80), c(20), c(160));
	game.drawImage(sprites, 21, 0, 20, 160, c(1280-20), c(p2-80), c(20), c(160));
}

function drawScore(){
	game.shadowColor = "rgba(0,0,0,0.5)";
    game.shadowBlur = 0;
    game.shadowOffsetX = 0;
    game.shadowOffsetY = c(3);
	game.font = c(70)+"px UpheavalPro"
	game.fillStyle = "#000000";
	game.textAlign = "end";
	game.fillText(p1s.toString(),c(1280/2-15),c(70));
	game.textAlign = "start";
	game.fillText(p2s.toString(),c(1280/2+15),c(70));
}

function drawLQBall(){
	game.shadowColor = "rgba(0,0,0,0.5)";
    game.shadowBlur = 0;
    game.shadowOffsetX = 0;
    game.shadowOffsetY = c(3);
    game.fillStyle = "#00CCFF";
    game.beginPath();
    game.arc(c(ball["x"]), c(ball["y"]), c(12), 0, 2 * Math.PI, false);
    game.fill();
    game.closePath();
}

function drawBall(){
	game.shadowColor = "rgba(0,0,0,0.5)";
    game.shadowBlur = 0;
    game.shadowOffsetX = 0;
    game.shadowOffsetY = c(3);
	game.drawImage(sprites, 42, 0, 24, 24, c(ball["x"]-12), c(ball["y"]-12), c(24), c(24));
}

function drawAnimations (){
	game.shadowColor = "rgba(0,0,0,0)";
	animations.forEach(function(elem, n){
		game.drawImage(elem.sprite, elem.sx+elem.w*(elem.current-1), elem.sy, elem.w, elem.h, c(elem.x), c(elem.y), c(elem.w), c(elem.h));
		elem.current++;
		if (elem.current==elem.frames){
			animations.splice(n, 1);
		}
	});
}

function drawHint(text){
	game.shadowColor = "rgba(0,0,0,0.5)";
    game.shadowBlur = 0;
    game.shadowOffsetX = 0;
    game.shadowOffsetY = c(3);
	game.font = c(35)+"px UpheavalPro"
	game.fillStyle = "#000000";
	game.textAlign = "center";
	game.fillText(text,c(1280/2),c(720-15));
}

function pause(){
	draw();
	if (menushown) return;
	document.querySelectorAll(".menu").forEach(function(elem){
		elem.style.display = "none";
	});
	for (var key in settings){
		if (document.querySelector(".pausemenu").querySelector("."+key)!=null){
			if (typeof(settings[key])=="number" && Boolean(settings[key])==true) 
				document.querySelector(".pausemenu").querySelector("."+key).value = settings[key];
			else 
				document.querySelector(".pausemenu").querySelector("."+key).checked = !!settings[key];
		}
	}
	menushown = false;
	animations = [];
	clearInterval(main);
	draw();
	document.querySelector(".pausemenu").style.display = "block";
}

function menu(){
	document.querySelectorAll(".menu").forEach(function(elem){
		elem.style.display = "none";
	});
	for (var key in settings){
		if (document.querySelector(".main").querySelector("."+key)!=null){
			if (typeof(settings[key])=="number" && Boolean(settings[key])==true) 
				document.querySelector(".main").querySelector("."+key).value = settings[key];
			else 
				document.querySelector(".main").querySelector("."+key).checked = !!settings[key];
		}
	}
	animations = [];
	clearInterval(main);
	reset();
	draw();
	document.querySelector(".main").style.display = "block";
	menushown = true;
}

function reset(){
	p1s = 0;
	p2s = 0;
	ball["x"] = 1280/2;
	ball["y"] = 720/2;
	var angle = -(Math.random() * 160 + 10);
	var radians = angle / 180 * Math.PI
	ball["xv"] = Math.sin(radians);
	ball["yv"] = Math.cos(radians);
}

function startSingle(){
	if(!sounds.ready){
	for (var key in sounds) {
		if (key!="music"){
    	sounds[key].volume = 0.0;
    	sounds[key].play();
    }
	}
	sounds.ready = true;
	}
	sounds.music.play();
	clearInterval(main);
	main = setInterval(play, 1000/60);
	document.querySelectorAll(".menu").forEach(function(elem){
		elem.style.display = "none";
	});
	menushown = false;
	hint = "";
}

function wait(){
	clearInterval(main);
	hint = "Готовьтесь";
	main = setTimeout(startSingle, 2000);
}

function bot(p2){
	var p2t;
	if (p2>ball["y"]){
		p2t = p2 - Math.min(settings.speed-5, p2-ball["y"]);
	}
	else if (p2<ball["y"]){
		p2t = p2 + Math.min(settings.speed-5, ball["y"]-p2);
	}
	else p2t = p2;
	return p2t;
}

function draw(){
	game.clearRect(0,0,c(1280),c(720));
	if(settings.graphics){
		drawBG();
		drawBall();
		drawPlayers();
		drawAnimations();
		drawScore();
	}
	else {
		drawLQBG();
		drawLQBall();
		drawLQPlayers();
		drawScore();
	}
	drawHint(hint);
}

function play(){
	ball["x"] += ball["xv"] * settings.speed;
	ball["y"] += ball["yv"] * settings.speed;
	p2 = bot(p2);
	if (p2>=720-80) p2 = 720-80;
	if (p2<=80) p2 = 80;
	if (ball["x"]<=0+10+20&&ball["y"]>=p1-80&&ball["y"]<=p1+80&&ball["xv"]<0) {
		var angle = p1 - ball["y"] + 90;
		var radians = angle / 180 * Math.PI
		ball["xv"] = Math.sin(radians);
		ball["yv"] = Math.cos(radians);
		ball["x"] = 32;
		if (settings.graphics)
		animations.push({
			"sprite": sprites,
			"sx": 0,
			"sy": 161,
			"w": 80,
			"h": 80,
			"frames": 32,
			"current": 1,
			"x": ball["x"]-12,
			"y": ball["y"]
		});
		soundPlay("hit2");
	}
	else if (ball["x"]>=1280-10-20&&ball["y"]>=p2-80&&ball["y"]<=p2+80&&ball["xv"]>0) {
		var angle = -(p2 - ball["y"] + 90) + (Math.random()-0.5) * 30;
		angle = Math.max(-170, Math.min(-10, angle));
		var radians = angle / 180 * Math.PI;
		ball["xv"] = Math.sin(radians);
		ball["yv"] = Math.cos(radians);
		ball["x"] = 1280-32;
		if (settings.graphics)
		animations.push({
			"sprite": sprites,
			"sx": 0,
			"sy": 242,
			"w": 80,
			"h": 80,
			"frames": 32,
			"current": 1,
			"x": ball["x"]+12-80,
			"y": ball["y"]
		});
		soundPlay("hit2");
	}
	else if (ball["x"]<=0){
		if (p2s==9){
			soundPlay("win");
			setTimeout(function(){
				menu();
			}, 3000);
		}
		p2s++;
		ball["x"] = 1280/2;
		ball["y"] = 720/2;
		p2 = 720/2;
		var angle = -(Math.random() * 160 + 10);
		var radians = angle / 180 * Math.PI;
		ball["xv"] = Math.sin(radians);
		ball["yv"] = Math.cos(radians);

		if (p2s<10){
			wait();
			soundPlay("goal");
		}
	}
	else if (ball["x"]>=1280) {
		if (p1s==9){
			soundPlay("win");
			setTimeout(function(){
				menu();
			}, 3000);
		}
		p1s++
		ball["x"] = 1280/2;
		ball["y"] = 720/2;
		p2 = 720/2;
		var angle = Math.random() * 160 + 10;
		var radians = angle / 180 * Math.PI
		ball["xv"] = Math.sin(radians);
		ball["yv"] = Math.cos(radians);

		if (p1s<10) {
			wait();
			soundPlay("goal");
		}
	}
	if ((ball["y"]<=0+10&&ball["yv"]<0)||(ball["y"]>=720-10&&ball["yv"]>0)) {
		ball["yv"] = -ball["yv"];
		soundPlay("hit1");
	}
	if (p2s>=10){
		ball["yv"]=ball["xv"]=0;
		hint = "Второй игрок победил";
	}
	if (p1s>=10){
		ball["yv"]=ball["xv"]=0;
		hint = "Первый игрок победил";
	}
	draw();
}

function toggleFullscreen () {
	if (document.webkitIsFullScreen==true) document.webkitCancelFullScreen();
	else document.documentElement.webkitRequestFullScreen();
}