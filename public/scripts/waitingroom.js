/*
Previously defined variables:
roomCode
username
otherUser
socket
*/
let showCode = document.getElementById('waiting-room-code');
let showName = document.getElementById('waiting-room-name');

// while(!showName){}

console.log(showCode, showName);

console.log(roomCode);
console.log('hello');

showCode.innerHTML = 'Room Code: ' + roomCode;
showName.innerHTML = 'Name: ' + username;
if (otherUser) document.getElementById('waiting_room_text').innerHTML = "Companion: " + otherUser;



function goToPlayRoom(){
	replaceBody('/partials/game.html');
	let scr = document.createElement('script');
	scr.src = '/scripts/game.js';
	scr.setAttribute('defer', 'defer');
	document.head.appendChild(scr); 
}

socket.on('newPlayer', (name) => {
	let p = document.getElementById('waiting_room_text');
	p.innerHTML = "Found player: " + name;
});


socket.on('starting', () => {
	document.getElementById('startIndicator').innerHTML = 'Starting...';
	setTimeout(() => {

	}, 2000);
});