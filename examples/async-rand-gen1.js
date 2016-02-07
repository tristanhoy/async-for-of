var forOf = require('../lib/index.js')

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