var responseTime = require('response-time');
var bodyParser = require('body-parser');
var PUBNUB = require('pubnub');

module.exports.pubnub = function(config){
	if(!config.pubnub.subscribe || !config.pubnub.publish) {
		console.log('You are missing either the subscribe or publish key for Pubnub');
		process.exit(1);
	}

	// var pubnub = new PUBNUB({
	// 	publishKey:config.pubnub.publish,
	// 	subscribeKey:config.pubnub.subscribe
	// });

	var pubnub = PUBNUB.init({
		publish_key:config.pubnub.publish,
		subscribe_key:config.pubnub.subscribe
	});

	return pubnub;
}

module.exports.express = function(app, passport){

	// Response time
	app.use(responseTime());

    // Include middleware to parse JSON
	app.use(bodyParser.json({limit: '5mb'}));

  	// Initialize passport
	app.use(passport.initialize());
}