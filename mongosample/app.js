var vertx = require('vertx.js');
var template = require('lib/js/template.js');
var staticfile = require('lib/js/staticfile.js');

var routeMatcher = new vertx.RouteMatcher();
var eb = vertx.eventBus;

var statics = {
    '/css/bootstrap.css': 'lib/css/bootstrap.css',
    '/css/bootstrap-responsive.css': 'lib/css/bootstrap-responsive.css'
};

staticfile.setStaticFiles(statics, routeMatcher);

/**
 * When you send a post request, you can't get form datas to use "req.params".
 * If you want to get form datas, you must use "req.dataHandler".
 * it's a pain to use it and I wrap the post handler with this function.
 * 
 * @param {function} callback first argument is a default request. second argument is a object of form data.
 */
function wrapPostHandler (callback) {
    return function (req) {
        req.dataHandler(function (buffer) {
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

            callback(req, params);
        });
    };
}

function index (req) {
    eb.send('test.persistor', {
        action: 'find',
        collection: 'messages',
        matcher: {}
    }, function (reply) {
        if (reply.status === 'ok') {
            template.renderTemplate(req, 'mongosample/templates/index.html', {messages: reply.results});
        } else {
            req.response.end(reply.message);
        }
    });
}

routeMatcher.get('/', index);

routeMatcher.post('/', wrapPostHandler(function (req, params) {
    eb.send('test.persistor', {
        action: 'save',
        collection: 'messages',
        document: {
            name: params.name,
            text: params.text
        }
    }, function (reply) {
        index(req);
    });
}));

vertx.createHttpServer().requestHandler(routeMatcher).listen(8080);


var mongoPersistorConf = {
    address: 'test.persistor',
    host: '127.0.0.1', //MongoPersister connect to 127.0.1.1 in my default environment.
    port: 27017,
    db_name: 'test'
};

vertx.deployVerticle('mongo-persistor', mongoPersistorConf, 1, function (argument) {
    console.log('connected');
});