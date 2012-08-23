[![build status](https://secure.travis-ci.org/baryshev/common-pool.png)](http://travis-ci.org/baryshev/common-pool)
# About 
Simple resource pool.

# Installation

	npm install common-pool

# Example

```js
var pool = require("common-pool");
var resourceCreate = function(callback) {
	someResource.create(function(error, resource) {
		callback(error, resource);
	});
};

var resourceDestroy = function(resource) {
	resource.destroy();
};

var maxPoolSize = 10;
var idleTimeout = 3600 * 1000;
var idleInterval = 30000; // Optional, 10000 by default

var resources = pool(resourceCreate, resourceDestroy, maxPoolSize, idleTimeout, idleInterval);

resources.take(function(error, resource) {
	if (error) {
		// Oh no!
		// Resource could not be created.
	} else {
		// Start working with resource.
		resource.doSomething(function(error) {
			if (error) {
				// Something wrong!
				// This is bad resource. Removing it from pool.
				resources.remove(resource);
			} else {
				// Action complete.
				// Returning resource to pool.
				resource.release(resource);
			}
		});
	}
});
```