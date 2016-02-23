var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');

var port = process.env.PORT || process.env.NODE_PORT || 3000;

//Read the client html into memory
//_dirname in node is the current directory
//in this case the same folder as the server is file
var index = fs.readFileSync(__dirname + '/../client/client.html');

function onRequest(request, response){
	response.writeHead(200,{"Content-Type":"text/html"});
	response.write(index);
	response.end();
}

var app = http.createServer(onRequest).listen(port);

console.log("Listening on 127.0.0.1:" + port);

//Pass in the http server into socketio and grab the websocket server as io
var io = socketio(app);

//Object to hold all of our connected users
var users = {};

var onJoined = function(socket){
	socket.on("join",function(data){
		
		users[Object.keys(users).length] = data;
		
		var joinMsg = {
			name:'server',
			msg:'There are ' + Object.keys(users).length + ' users online'
		};
	
	
		socket.emit('msg',joinMsg);
		socket.name = data.name;
		
		socket.join('room1');
		
		socket.broadcast.to('room1').emit('msg',{
			name:'server',
			msg:data.name + " has joined the room."
		});
		
		socket.emit('msg',{
			name:'server',
			msg:'You joined the room'
		});
		
	});
	
};

var onDate = function(socket){
	socket.on('getDate',function(data){
		socket.emit('msg',{
			name:'server',
			msg:"The date is " + data
		});
	});
};

var onMsg = function(socket){
	socket.on('msgToServer',function(data){
		
		io.sockets.in('room1').emit('msg',{
			name:socket.name,
			msg:data.msg
		});
		
	});
};

var onDisconnect = function(socket){
	socket.on('disconnect',function(data){
		
		io.sockets.in('room1').emit('msg',{
			msg:socket.name + " has left the room."
		});
		
	});
};

var onRandNum = function(socket){
	socket.on('randNumber',function(data){
		
		io.sockets.in('room1').emit('msg',{
			name:'server',
			msg: socket.name + " rolled a " + data + " on a six sided die"
		});
		
	});
};

var onActionCommands = function(socket){
	socket.on('getAction',function(data){
		
		io.sockets.in('room1').emit('msg',{
			name:'server',
			msg: socket.name + " " + data
		});
		
	});
};

io.sockets.on("connection", function(socket){
	onJoined(socket);
	onMsg(socket);
	onDisconnect(socket);
	onRandNum(socket);
	onDate(socket);
	onActionCommands(socket);
});

console.log('websocket server started');



