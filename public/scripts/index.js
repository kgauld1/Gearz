var room = new GearRoom(document.getElementById('animation-screen'));
room.addMotor(90, 510, 1, document.getElementById('motor-switch'));
room.addGears([1, 1, 1, 2, 2, 2]);
room.addEndGear(480, 510);
room.run();

var socket = io();

var roomCode = "";
var username = "";
var otherUser = "";

function checkHasName(obj){
	if (obj.value != ''){
		for (let el of document.getElementsByTagName('button'))
			el.disabled = false;
	}
}

async function replaceBody(file){
	let resp = await fetch(file);
	let text = await resp.text();
	document.body.innerHTML = text;
}

function joinRandom(){
	console.log('random');
	let name = document.getElementById('name').value;
	socket.emit('joinRandom', name);
}

function joinCode(){
	let name = document.getElementById('name').value;
	let code = document.getElementById('codeInput').value;
	socket.emit('joinCode', {playerName: name, code: code});
}

async function goToWaitingRoom(){
	await replaceBody('/partials/waitingroom.html');
	let scr = document.createElement('script');
	scr.src = '/scripts/waitingroom.js';
	scr.setAttribute('defer', 'defer');
	document.head.appendChild(scr); 
}

socket.on('joinRandom', data => {
	if (data.error) return console.log('error', data.error);
	else {
		roomCode = data.key;
		username = data.name;
		otherUser = data.player;
		goToWaitingRoom();
	}
});

socket.on('joinCode', data => {
	if (data.error) return console.log(data.error);
	else {
		roomCode = data.key;
		username = data.name;
		otherUser = data.player;
		goToWaitingRoom();
	}
});

