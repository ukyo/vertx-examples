var vertx = require('vertx');
var template = require('lib/js/template');
var staticfile = require('lib/js/staticfile');

var server = vertx.createHttpServer();
var rm = new vertx.RouteMatcher();
var UUID = java.util.UUID;
var eb = vertx.eventBus;

var wsdict = [];

function sendNum () {
	var i = 0;
	for (var k in wsdict) ++i;
	var num = JSON.stringify({num: i});
	for (k in wsdict) wsdict[k].writeTextFrame(num);
}

server.websocketHandler(function (ws) {
	var id = UUID.randomUUID().toString();
	wsdict[id] = ws;

	sendNum();

	ws.dataHandler(function (buffer) {
		var text = buffer.getString(0, buffer.length());
		var message = JSON.parse(text);
		console.log(text);

		for (var k in wsdict) {
			wsdict[k].writeTextFrame(text);
		}

		eb.send('chatroom.persistor', {
			action: 'save',
			collection: 'messages',
			document: message
		}, function () {});
	});

	ws.closedHandler(function () {
		console.log('close [id:' + id + ']');
		delete wsdict[id];
		sendNum();
	});
});

rm.get('/', function (req) {
	eb.send('chatroom.persistor', {
		action: 'find',
		collection: 'messages',
		matcher: {}
	}, function (reply) {
		var messages;
		if (reply.status === 'ok') {
			messages = reply.results;
		} else {
			messages = [{name: 'hello bot', text: 'hello!'}];
		}
		template.renderTemplate(req, 'chatroom/chatroom.html', {messages: messages.reverse()});
	});
});

staticfile.setStaticFiles({
	'/css/bootstrap.css': 'lib/css/bootstrap.css',
	'/js/jquery.js': 'lib/js/jquery-1.7.2.min.js'
}, rm);

server.requestHandler(rm).listen(8080);

var mongoPersistorConf = {
    address: 'chatroom.persistor',
    host: '127.0.0.1', //MongoPersister connect to 127.0.1.1 in my default environment.
    port: 27017,
    db_name: 'test'
};

vertx.deployVerticle('mongo-persistor', mongoPersistorConf, 1, function (argument) {
    console.log('connected');
});