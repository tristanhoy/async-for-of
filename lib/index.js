var convert = obj => {
	if (obj.length || obj.next)
		return obj
	if (obj.constructor.name == 'GeneratorFunction')
		return obj()
	if (obj.constructor.name == 'Function')
		return (function*() { while (true) yield obj()})()
}

module.exports = (iterable, handler) => {
	var gen = function*() {
		for (item of convert(iterable)) {
			var state = yield new Promise(resolve =>
				handler(
					item, 
					() => resolve(),
					result => resolve({ result })
				)
			)
			
			if (state) return state.result
		}
	}()
	
	var iterate = i => i.done ? i.value : 
		i.value.then(state => iterate(gen.next(state)))
	
	return new Promise(resolve => resolve(iterate(gen.next())))
}