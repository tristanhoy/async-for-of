var forOf = require('../lib/index.js')
var net = require('net')

var server = net.createServer();
server.listen(8002);

var peers = [
	{ host: '127.0.0.1', port: 8000 },
	{ host: '127.0.0.1', port: 8001 },
	{ host: '127.0.0.1', port: 8002 }
]

forOf(peers, (peer, next, end) => {
	console.log('Attempting to connect to ' + JSON.stringify(peer))
	
	var socket = net.connect(peer.port, peer.host);
	socket.on('connect', () => end({ peer, socket }));
	socket.on('error', next)
}).then(result => {
	console.log('Peer found: ' + JSON.stringify(result.peer))
	
	//do something with result.socket
	
	result.socket.end()
	result.socket.destroy()
	server.close();
})