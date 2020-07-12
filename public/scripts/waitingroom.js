/*
Previously defined variables:
roomCode
username
otherUser
socket
*/
let showCode = document.getElementById('waiting-room-code');
let showName = document.getElementById('waiting-room-name');

showCode.innerHTML = 'Room Code: ' + roomCode;
showName.innerHTML = 'Name: ' + username;
if (otherUser) document.getElementById('waiting_room_text').innerHTML = "Partner: " + otherUser;

async function goToPlayRoom(){
	await replaceBody('/game.html');
	let scr = document.createElement('script');
	scr.src = '/scripts/game.js';
	scr.setAttribute('defer', 'defer');
	document.head.appendChild(scr); 
}

socket.on('newPlayer', (name) => {
	console.log(name);
	let p = document.getElementById('waiting_room_text');
	p.innerHTML = "Found player: " + name;
});

var started = false;
socket.on('starting', () => {
	if (started) return;
	started = true;
	document.getElementById('startIndicator').innerHTML = 'Starting...';
	setTimeout(() => {
		goToPlayRoom();
	}, 2000);
});

socket.on('disconnect', () => {
	window.location.href = '/';
})