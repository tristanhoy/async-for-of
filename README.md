# Promisified, asynchronous ES6 for..of

## Installation

```
npm install async-for-of
```
## Usage
**async-for-of** can loop asynchronously over any iterable, only requesting the item when "next" is called

```js
var forOf = require('async-for-of')

forOf(iterable, (item, next, end) => { 
	//do something with item, then call next() or end(result)
}).then((result) => {
	//do something with the result
})
```

**iterable** is an array, generator, function or custom iterable returning any type (typically Promises)

**forOf** returns a Promise that is fulfilled when:

- **end** is called (with resolve with the value passed to that function)
- the iterable returns **done** (will resolve with an undefined result)

Check out the tests to see expected behaviour.

##Examples
### Asynchronous Random Number Generator
This example asynchronously generates random numbers and resolves when the result matches certain criteria

```js
var asyncRandomGenerator = () => {
	console.log('Generating value')
	return Promise.resolve(Math.random())
}

forOf(asyncRandomGenerator, (item, next, end) => {
	item.then(val => {
		console.log('Inspecting value')
		if (val < 0.1)
			end(val)
		else
			next()
	});
}).then(val => console.log('Success: ' + val))
```

### Asynchronous Random Number Generator #2
This builds on the above example, using an ES6 generator to add some control flow - in this case, enforcing the maximum number of attempts

```js
var asyncRandomGenerator = function*() {
	var maxAttempts = 5
	for (var i = 0; i < maxAttempts; i++) {
		console.log('Generating value')
		yield Promise.resolve(Math.random())
	}
	throw 'Max Attempts Exceeded'
}

forOf(asyncRandomGenerator(), (promise, next, end) => {
	promise.then(val => {
		console.log('Inspecting value')
		if (val < 0.1)
			end(val)
		else
			next()
	});
}).then(val => console.log('Success: ' + val))
.catch(err => console.log('Failure: ' + err))
```


### Peer Discovery
This example finds an active peer from a list (ideally broadcasted) and resolves with a socket

```js
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
})
```