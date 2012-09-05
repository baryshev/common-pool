var Pool = function(create, destroy, size, idleTimeout, idleInterval) {
	if (!idleInterval) idleInterval = 10000;
	if (!(this instanceof Pool)) return new Pool(create, destroy, size, idleTimeout, idleInterval);

	var count = 0;
	var available = 0;
	var queue = [];
	var resources = [];
	var that = this;

	var checkIdleTimeout = function() {
		var time = new Date().getTime();
		for (var i = 0; i < available; i++) {
			if (resources[i].time + idleTimeout < time) {
				that.remove(resources.splice(i, 1)[0].resource);
				i--;
			}
		}
	};

	this.take = function(callback) {
		if (available > 0) {
			available--;
			callback(null, resources.splice(0, 1)[0].resource);
		} else {
			if (count < size) {
				create(function(error, resource) {
					!error && count++;
					callback(error, resource);
				});
			} else {
				queue.push(callback);
			}
		}
	};

	this.release = function(resource) {
		if (resource !== null) {
			resources.push({ time: new Date().getTime(), resource: resource });
			available++;
			queue.length && that.take(queue.shift());
		}
	};

	this.remove = function(resource) {
		if (resource !== null) {
			available--;
			destroy(resource);
			count--;
			queue.length && that.take(queue.shift());
		}
	};

	this.removeAll = function() {
		if (count > 0) {
			for (var i = count - 1; i >= 0; i--) {
				that.remove(resources.splice(i, 1)[0].resource);
			}
		}
	};

	setInterval(checkIdleTimeout, idleInterval);
};

module.exports = Pool;
