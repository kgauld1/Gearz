
function cleanName(str){
	str = str.replace(/</g, '&lt').replace(/>/g, '&gt');
	if(str.length > 15) str = str.substr(0, 15);
	return str;
}


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
				io.in(key).emit('starting');
			}
		});

		socket.on('joinCode', ({playerName, code}) => {
			name = cleanName(playerName);
			group = code;
			console.log(code, available);
			if (code in available){
				let prevPlayer = "";
				for (let i of available[code].players) prevPlayer = i;
				available[code].players.push(name);
				socket.join(code);
				socket.emit('joinCode', {key: code, name: name, player: prevPlayer});

				io.to(code).emit('newPlayer', name);

				if (available[code].players.length >= maxPlayers){
					startGame(code);
					io.in(code).emit('starting');
				}
			}
			else if (code){
				available[code] = {players: [name]};
				socket.emit('joinCode', {key: code, name: name, player: ''});
			}
			else socket.emit('joinCode', {error: 'error'});
		});

		socket.on('chat', message => {
			io.in(group).emit(message);
		});

		socket.on('place', (row, col, size) => {
			io.in(group).emit('palce', (row, col, size, color))
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
				delete available[group];
				if (available[group].players.length == 0) delete available[group];
				else io.in(group).emit('disconnected', name);
			}
		})
		
	});
}