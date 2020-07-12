var messages = document.getElementById('messages');
var chatInput = document.getElementById('chat-input');

console.log(messages, chatInput);

var room = new GearRoom(document.getElementById('animation-screen'));

// CHAT
chatInput.addEventListener('keyup', e => {
	if (e.keyCode == 13 && chatInput.value){
		socket.emit('chat', chatInput.value);
		chatInput.value = "";
	}
});

socket.on('chat', ({message, name, you}) => {
	console.log(message, name, you);
	let color = you ? 'red' : 'blue';
	let html = `
	<p> <span style="color: ${color}">${name}: </span>${message}</p>
	`;
	messages.innerHTML += html;
	messages.scrollTo(0,messages.scrollHeight);
})

socket.on('newLevel', ({motor, end, gears}) => {
	delete room;
	room = new GearRoom(document.getElementById('animation-screen'));
	room.addMotor(motor.x, motor.y, motor.type, document.getElementById('motor-switch'));
	room.addEndGear(end.x, end.y, document.getElementById('motor-switch'));
	room.addGears(gears);
	room.run;
});

socket.on('place', ({x, y, num}) => {
	room.placeGear(x, y, num);
});

socket.on('run', () => {
	document.getElementById('motor-toggle').click();
});