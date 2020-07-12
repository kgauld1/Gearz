

function clean(str){
	str = str.replace(/</g, '&lt').replace(/>/g, '&gt');
	return str;
}

function cleanName(str){
	str = clean(str);
	if(str.length > 15) str = str.substr(0, 15);
	return str;
}




module.exports = (http) => {
	var io = require('socket.io')(http);

	var maxPlayers = 2;
	var colors = ['red', 'blue'];

	var playing = {};
	var available = {};

	var uplateLevels = [];

	function createGroup(){
		let randKey = Math.round(Math.random()*1e5);
		available[randKey] = {players: []};
		return "" + randKey;
	}

	function startGame(key){
		playing[key] = available[key];
		playing[key].level = 1;
		playing[key].board = [];	
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
			console.log('message', name, message);
			socket.to(group).emit('chat', {message: message, name: name, you: false});
			socket.emit('chat', {message: message, name: name, you: true})
		});

		socket.on('place', (x, y, num) => {
			io.in(group).emit('place', {x: x, y: y, num: num});
		});

		socket.on('getGroup', () => {
			socket.emit('getGroup', group);
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
		})
		
	});
}