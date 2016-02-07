var forOf = require('../lib/index.js')

describe('iterable argument', () => {
	var funcP = () => Promise.resolve('value')
	var arrayP = [ funcP(), funcP() ]
	var genP = function*() { while (true) yield funcP() }
	var testP = iterable => {
		var count = 0
		return new Promise(resolve =>
			forOf(iterable, (item, next, end) =>
				item.then(value => {
					if (value == 'value')
						count++
					if (count == 2)
						end()
					next()
				})
			).then(resolve)
		)
	}
	
	var genV = function*() { while (true) yield 'value' }
	var testV = iterable => {
		var count = 0
		return new Promise(resolve =>
			forOf(iterable, (item, next, end) => {
				if (item == 'value')
					count++
				if (count == 2)
					end()
				next()
			}).then(resolve)
		)
	}
	
	it('Should accept a function that returns a value', () => testV(() => 'value'))
	it('Should accept a function that returns a promise', () => testP(funcP))
	it('Should accept a constructor for a generator that returns values', () => testV(genV))
	it('Should accept a constructor for a generator that returns promises', () => testP(genP))
	it('Should accept an instance of a generator that returns values', () => testV(genV()))
	it('Should accept an instance of a generator that returns promises', () => testP(genP()))
	it('Should accept an array of values', () => testV([ 'value', 'value' ]))
	it('Should accept an array of promises', () => testP(arrayP))
})

describe('When end is explicitly called', () => {
	var iterable = [ Promise.resolve(), Promise.resolve() ]
	
	it('Should resolve immediately and stop iterating', () => {
		var count = 0
		return forOf(iterable, (item, next, end) => {
			count++
			item.then(end)
		}).then(msg =>
			expect(count).to.equal(1)
		)
	})
	
	it('Should resolve with the value passed to end', () =>
		forOf(iterable, (item, next, end) =>
			item.then(() => end('done'))
		).then(msg =>
			expect(msg).to.equal('done')
		)
	)
	
	
	it('Should ignore subsequent calls to next', () => {
		var count = 0
		return forOf(iterable, (item, next, end) => {
			count++
			item.then(() => {
				end()
				next()
			})
		}).then(msg =>
			expect(count).to.equal(1)
		)
	})
})

describe('When next is called', () => {
	var iterable = [ Promise.resolve(), Promise.resolve() ]
	var count = 0
	it('Should ignore subseqent calls to next or end until the next iteration', () => 
		forOf(iterable, (item, next, end) => {
			count++
			item.then(() => {
				next()
				next()
				end()
			})
		}).then(msg =>
			expect(count).to.equal(iterable.length)
		)
	)
})

describe('When end or next are not called', () => {
	var iterable = [ Promise.resolve(), Promise.resolve() ]
	it('Should never resolve', () => {
		new Promise((resolve, reject) => {
			forOf(iterable, () => { })
				.then(reject)
			setTimeout(resolve, 50)
		})
	})
})

describe('When iterable argument is an array of promises', () => {
	var iterable = [ Promise.resolve(), Promise.resolve() ]
	describe('And end is not explicitly called', () => {
		it('Should resolve after iterating through all items', () => {
			var count = 0
			return forOf(iterable, (item, next, end) => {
				count++
				item.then(next)
			}).then(() => 
				expect(count).to.equal(iterable.length)
			)
		})
	})
})

describe('When iterable argument is an array of values', () => {
	var iterable = [ 1, 2 ]
	describe('And end is not explicitly called', () =>
		it('Should resolve after iterating through all items', () => {
			var sum = 0
			return forOf(iterable, (item, next, end) => {
				sum += item
				next()
			}).then(() => 
				expect(sum).to.equal(3)
			)
		})
	)
})
	
describe('When iterable argument is a generator', () => {
	describe('And the generator throws an exception', () => {	
		var iterable = (function*() {
			var x = 2
			while (x--)
				yield Promise.resolve()
			throw 'End of list'
		})
	
		it('Should reject', () => 
			new Promise(resolve => 
				forOf(iterable, (item, next, end) => item.then(next))
				.catch(resolve)
			)
		)
	})
})

describe('When iterable argument is a function', () => {
	describe('And the function throws an exception', () => {
		var iterable = () => { throw 'Failure' }
	
		it('Should reject', () => 
			new Promise(resolve => 
				forOf(iterable, (item, next, end) => item.then(next))
				.catch(resolve)
			)
		)
	})
})

describe('When handler throws an exception', () => {
	var iterable = [ 1 ]

	it('Should reject', () => 
		new Promise(resolve => 
			forOf(iterable, (item, next, end) => { throw 'Failure' })
			.catch(resolve)
		)
	)
})