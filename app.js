var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var mongoose = require('mongoose');
var fs = require('fs');
var passport = require('passport');

var app = module.exports.app = express();

var connectMongo = module.exports.connectMongo = function(done){
	// var mongoose = require('mongoose');
	console.log('connecting...');

	// // Set a different message if the Mongo instance we are connecting to is remote
	mongoose.connection.once('open', function() {
		console.log('Conneted to mongodb');
		final();
	});

	mongoose.connection.on('error', function(err) {
		console.log('Error connecting to mongodb');
		console.log(err);
	});
	mongoose.connect('mongodb://127.0.0.1:27017/chatroom');

}


var final = function(){
	var config = module.exports.config = require('./config/config');
	var pubnub = module.exports.pubnub = require('./config/startup').pubnub(config);

	// set json parser
	app.use(bodyParser.json({limit: '5mb'}));
	
	// Bootstrap Mongooose Models
	var models_path = __dirname + '/models';
	fs.readdirSync(models_path).forEach(function(file) {
		if(~file.indexOf('.js')) require(models_path + '/' + file);
	});


	require('./config/startup').express(app,passport);	

	require('./config/routes')(app,passport);

	console.log('app ready');
	app.listen(5309);		

}

connectMongo();