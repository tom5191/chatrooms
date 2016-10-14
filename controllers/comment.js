var bb = require('bluebird');
var mongoose = require('mongoose');
	mongoose.Promise = bb;
var Comment = mongoose.model('Comment');
var pubnub = require('./../app').pubnub;

module.exports.create = function(req,res){
	if(!req.body.text) return res.status(400).json({status:400, error:"missing field", message:"You are missing the text field"});

	var comment = new Comment();
	comment.text = req.body.text;
	comment.author = req.user;
	comment.chatroom = req.params[0];

	comment
		.save()
		.then(function(comment){
			function done(){
				console.log('New comment on ' + req.params[0]);
				return res.json(comment);
			}

			function error(error){
				console.log('Error occured while publishing: ' + error);
				return res.status(500).json({status:500, error:'Pubnub error', message:error});
			}

			pubnub.publish({
				channel:comment.chatroom,
				message:comment,
				callback:done,
				error:error
			});
		}).catch(function(error){
			return res.status(500).json({status:500, error:'Mongo save error', message:error});
		});
}