var messages = document.getElementById('messages');
var chatInput = document.getElementById('chat-input');
var currentLevel = 0;

console.log(messages, chatInput);

var room = new GearRoom(document.getElementById('animation-screen'));

socket.emit('getLevel', currentLevel);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function test(){
	room.noMovement();
	document.getElementById('motor-switch').click();
	for (let i = 0; i < 5; i++){
		console.log(room.endGear);
		if (Math.abs(room.endGear.angularVelocity) > 0.02) return true;
		await sleep(200);
	}
	return false;

}

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

socket.on('getLevel', ({motor, end, gears, level}) => {
	delete room;
	document.getElementById('animation-screen').innerHTML = '';
	room = new GearRoom(document.getElementById('animation-screen'));
	room.addMotor(motor.x, motor.y, motor.type, document.getElementById('motor-switch'));
	currentLevel = level;
	room.addEndGear(end.x, end.y, document.getElementById('motor-switch'));
	room.addGears(gears);
	room.run();
	room.noMovement();
});

socket.on('place', data => {
	room.placeGear(data.x, data.y, data.num);
});

socket.on('run', async () => {
	let passed = await test();
	console.log('passed: ', passed);
	socket.emit('passed', passed);
});
