var vertx = require('vertx');

var server = vertx.createHttpServer();
var UUID = java.util.UUID;

var wsdict = [];
server.websocketHandler(function (ws) {
	var id = UUID.randomUUID().toString();
	wsdict[id] = ws;
	ws.dataHandler(function (buffer) {
		var text = buffer.getString(0, buffer.length());
		console.log(text);
		for (var k in wsdict) {
			wsdict[k].writeTextFrame(text);
		}
	});

	ws.closedHandler(function () {
		console.log('close [id:' + id + ']');
		delete wsdict[id];
	});
});

server.requestHandler(function (req) {
	req.response.sendFile('tracking/ws.html');
});

server.listen(8080);