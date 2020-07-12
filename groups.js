const fs = require('fs');

function clean(str){
	str = str.replace(/</g, '&lt').replace(/>/g, '&gt');
	return str;
}

function cleanName(str){
	str = clean(str);
	if(str.length > 15) str = str.substr(0, 15);
	return str;
}

var rawdata = fs.readFileSync('levels.json');
var levels = JSON.parse(rawdata);


module.exports = (http) => {
	var io = require('socket.io')(http);

	var maxPlayers = 2;
	var colors = ['red', 'blue'];

	var playing = {};
	var available = {};

	function createGroup(){
		let randKey = Math.round(Math.random()*1e5);
		available[randKey] = {players: []};
		return "" + randKey;
	}

	function startGame(key){
		playing[key] = available[key];
		playing[key].level = 1;
		playing[key].passed = null;
		delete available[key];
	}
	
	io.on('connection', (socket) => {
		let group = "";
		let name = "";
		let color = "";

		socket.on('joinRandom', (playerName) => {
			name = cleanName(playerName);
			let key;
			if (Object.keys(available).length == 0)	key = createGroup();
			else key = Object.keys(available)[0];
			group = key;

			let prevPlayer = "";
			for (let i of available[key].players) prevPlayer = i;
			available[key].players.push(name);
			socket.join(key);
			
			socket.emit('joinRandom', {key: key, name: name, player: prevPlayer});
			io.to(key).emit('newPlayer', name);
			
			if (available[key].players.length >= maxPlayers){
				startGame(key);
				setTimeout(() => {
					io.in(key).emit('starting');
					socket.emit('starting');
				}, 1000);
			}
		});

		socket.on('getLevel', before => {
			playing[group].level = before + 1;
			let send = levels[playing[group].level];
			send.level = before + 1;
			socket.emit('getLevel', send);
		});

		socket.on('passed', did => {
			if (playing[group].passed == null) playing[group].passed = did;
			else {
				playing[group].passed = playing[group].passed || did;
				if (playing[group].passed){
					playing[group].passed = null;
					playing[group].level++;
					let send = levels[playing[group].level];
					send.level = playing[group].level;
					io.in(group).emit('getLevel', send);
				}
				else io.in(group).emit('disconnect');
			}
		})


		socket.on('joinCode', ({playerName, code}) => {
			name = cleanName(playerName);
			group = code;
			if (code in available){
				let prevPlayer = "";
				for (let i of available[code].players) prevPlayer = i;
				available[code].players.push(name);
				socket.join(code);
				socket.emit('joinCode', {key: code, name: name, player: prevPlayer});

				io.to(code).emit('newPlayer', name);

				if (available[code].players.length >= maxPlayers){
					setTimeout(() => {
						startGame(code);
						io.in(code).emit('starting');
						socket.emit('starting');
					}, 1000);
					
				}
			}
			else if (code){
				available[code] = {players: [name]};
				socket.join(code);
				socket.emit('joinCode', {key: code, name: name, player: ''});
			}
			else socket.emit('joinCode', {error: 'error'});
		});

		socket.on('chat', message => {
			message = clean(message);
			socket.to(group).emit('chat', {message: message, name: name, you: false});
			socket.emit('chat', {message: message, name: name, you: true})
		});

		socket.on('place', data => {
			io.in(group).emit('place', data);
		});

		socket.on('getGroup', () => {
			socket.emit('getGroup', group);
		});

		socket.on('run', () => {
			io.in(group).emit('run');
		});

		socket.on('disconnect', () => {
			socket.leave(group);
			if (group in playing){
				let index = playing[group].players.indexOf(name);
				delete playing[group];
				io.in(group).emit('disconnect');
			}
			if (group in available){
				let index = available[group].players.indexOf(name);
				delete available[group].players[index];
				if (available[group].players.length == 0) delete available[group];
				else io.in(group).emit('disconnected', name);
			}
		});
		
	});
}