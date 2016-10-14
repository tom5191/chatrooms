var controllerDirectory = './../../controllers/';
var bearerAuth = require(controllerDirectory+"authentication").bearerAuth;
var basicAuth = require(controllerDirectory+"authentication").basicAuth;


module.exports = function(app){
	// Auth
	app.post(/^\/login$/, basicAuth, require(controllerDirectory+"authentication").accessToken);

	app.post(/^\/register$/, require(controllerDirectory+"user").create, require(controllerDirectory+"authentication").accessToken);

	// Chatrooms
	app.get(/^\/chatrooms?$/, require(controllerDirectory+"chatroom").index);

	app.get(/^\/chatrooms?\/([0-9a-z]{24})$/, require(controllerDirectory+"chatroom").show);

	app.post(/^\/chatrooms?$/, bearerAuth, require(controllerDirectory+'chatroom').create);

	app.post(/^\/chatrooms?\/([0-9a-z]{24})\/comment$/, bearerAuth, require(controllerDirectory+"comment").create);

	app.use(function(req,res){
		console.log('Error 404');
		res.status(404).json({message:'Invalid route'});
	});
}