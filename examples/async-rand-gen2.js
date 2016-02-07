var forOf = require('../lib/index.js')

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
  })
}).then(val => console.log('Success: ' + val))
.catch(err => console.log('Failure: ' + err))