var bb = require('bluebird');
var mongoose = require('mongoose');
	mongoose.Promise = bb;
var User = mongoose.model('User');
var bcrypt = require('bcrypt-as-promised');

module.exports.create = function(req,res, done){
	var validate = validateUser(req.body);

	validate.then(function(body){
		var user = new User();
		user.username = body.username;
		user.email = body.email;
		user.displayName = body.username;

		return bcrypt.hash(body.password).then(function(hash){
			user.password = hash;
			return user; 
		}).catch(function(error){
			console.log(error);
			return res.status(500).json({message:error});
		});
	}).then(function(user){
		return user.save().then(function(user){
			req.user = user._id; 
			done();
		}).catch(function(error){
			console.log(error);
			return res.status(500).json({message:error});
		});
	}).catch(function(error){
		console.log(error);
		return res.status(500).json({message:error});
	});
}


module.exports.update = function(req,res){
	var user = User.findOne({_id:req.user, deleted:false}).exec();

	user.then(function(user){
		if(req.body.displayName) user.displayName = req.body.displayName;
		if(req.body.email) user.email = req.body.email;

		user.save().then(function(){
			return res.status(200).end();
		}).catch(function(error){
			console.log("Mongo save error: " + error.message);
			return res.status(500).json({status:500, error:'Mongo save error', message:error});
		});
	}).catch(function(error){
		console.log("Error: " + error.message);
		return res.status(500).json({status:500, error:'Mongo error', message:error});
	});
}

var validateUser = function(body){
	return bb.try(function(){
		if(!body.username) throw('no username');
		if(!body.password) throw('no password');
		if(!body.email) throw('no email');
		return body;
	});
}