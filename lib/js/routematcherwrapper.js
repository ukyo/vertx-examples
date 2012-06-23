var rmwrapper = (typeof module !== 'undefined' && module.exports) || {};
rmwrapper.RouteMatcher = RouteMatcher;

function RouteMatcher (routeMatcher) {
	this._rm = routeMatcher;
}

RouteMatcher.prototype = {
	get: function (pattern, callback) {
		this._rm.get(pattern, callback);
	},

	post: function (pattern, callback) {
		this._rm.post(pattern, function (request) {
			Request.create(request, callback);
		});
	},

	put: function (pattern, callback) {
		this._rm.put(pattern, callback);
	},

	delete: function (pattern, callback) {
		this._rm.delete(pattern, callback);
	},

	options: function (pattern, callback) {
		this._rm.options(pattern, callback);
	},

	head: function (pattern, callback) {
		this._rm.get(pattern, callback);
	},

	trace: function (pattern, callback) {
		this._rm.get(pattern, callback);
	},

	connect: function (pattern, callback) {
		this._rm.get(pattern, callback);
	},

	all: function (pattern, callback) {
		this._rm.get(pattern, callback);
	},

	getWithRegEx: function (pattern, callback) {
		this._rm.getWithRegEx(pattern, callback);
	},

	postWithRegEx: function (pattern, callback) {
		this._rm.postWithRegEx(pattern, function (request) {
			Request.create(request, callback);
		});
	},

	putWithRegEx: function (pattern, callback) {
		this._rm.putWithRegEx(pattern, callback);
	},

	deleteWithRegEx: function (pattern, callback) {
		this._rm.deleteWithRegEx(pattern, callback);
	},

	optionsWithRegEx: function (pattern, callback) {
		this._rm.optionsWithRegEx(pattern, callback);
	},

	headWithRegEx: function (pattern, callback) {
		this._rm.headWithRegEx(pattern, callback);
	},

	traceWithRegEx: function (pattern, callback) {
		this._rm.traceWithRegEx(pattern, callback);
	},

	connectWithRegEx: function (pattern, callback) {
		this._rm.connectWithRegEx(pattern, callback);
	},

	allWithRegEx: function (pattern, callback) {
		this._rm.allWithRegEx(pattern, callback);
	},

	noMatch: function (pattern, callback) {
		this._rm.noMatch(pattern, callback);
	}
};

function Request(request, params) {
	this._req = request;
	this.uri = request.uri;
	this.path = request.path;
	this.query = request.query;
	this.response = request.response;
	this._params = params;
}

Request.prototype = {
	headers: function () {
		return this._req.headers();
	},

	params: function () {
		return this._params;
	}
};

Request.create = function (request, callback) {
	request.dataHandler(function (buffer) {
		var query = buffer.getString(0, buffer.length()),
			params = {},
			i = 0,
			qs = query.split('&'),
			n = qs.length,
			pair;

		for(; i < n; ++i) {
			pair = qs[i].split('=');
			params[pair[0]] = decodeURIComponent(pair[1]);
		}

		callback(new Request(request, params));
	});
};