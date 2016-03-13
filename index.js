/*jslint node: true */
'use strict';

// Declare variables used
var app, base_url, client, express, hbs, io, port, rtg, subscribe;

// Define values
express = require('express');
app = express();
port = process.env.PORT || 5000;
base_url = process.env.BASE_URL || 'http://localhost:5000';
hbs = require('hbs');

// Set up connection to Redis
/* istanbul ignore if */
if (process.env.REDISTOGO_URL) {
	rtg = require("url").parse(process.env.REDISTOGO_URL);
	client = require("redis").createClient(rtg.port, rtg.hostname);
	subscribe = require("redis").createClient(rtg.port, rtg.hostname);
	client.auth(rtg.auth.split(":")[1]);
	subscribe.auth(rtg.auth.split(":")[1]);
} else {
	client = require("redis").createClient();
	subscribe = require("redis").createClient();
}

// set up templating
app.set('views', __dirname + '/views');
app.set('view engine', "hbs");
app.engine('hbs', require('hbs').__express);

// register partials
hbs.registerPartials(__dirname + '/views/partials');

// set url
app.set('base_url', base_url);

// define index route
app.get('/', function(req, res) {
	res.render('index');
});

// server static files
app.use(express.static(__dirname + '/static'));

// listen
io = require('socket.io')({
}).listen(app.listen(port));

// Handle new messages
io.sockets.on('connection', function(socket) {
	// Subscribe to the Redis channel
	subscribe.subscribe('ChatChannel');

	//Handle incoming messages
	socket.on('send', function(data) {
		// Publish it
		client.publish('ChatChannel', data.message);
	});

	var callback = function(channel, data) {
		socket.emit('message', data);
		console.log(data);
	};
	subscribe.on('message', callback);

	// Handle disconnect
	socket.on('disconnect', function() {
		console.log('disconnect');
		subscribe.removeListener('message', callback);
	});
});

console.log("listen on port " + port);