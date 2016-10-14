var bb = require('bluebird');
var mongoose = require('mongoose');
	mongoose.Promise = bb;
var Chatroom = mongoose.model('Chatroom');
var Comment = mongoose.model('Comment');
var async = require('async');

module.exports.create = function(req,res){
	var validate = validateChatroomCreate(req.body);

	validate
		.then(function(body){
			var newChatroom = new Chatroom();
			newChatroom.name = body.name;
			newChatroom.category = req.body.category;
			newChatroom.creator = req.user;
			newChatroom.owner = req.user;
			newChatroom.tags = ['chatroom'];

			if(body.tags){
				async.each(body.tags, function(tag){
					newChatroom.tags.push(tag);
				});
			}

			return newChatroom;
		}).then(function(chatroom){
			chatroom.save().then(function(chatroom){
				return res.json(chatroom);
			}).catch(function(error){
				console.log("Error: " + error.message);
				return res.status(500).json({status:500, error:'Mongo save error', message:error});
			});
		}).catch(function(error){
			console.log("Error: " + error.message);
			return res.status(error.status).json({status:error.status, error:error.error, message:error.message});
		});
}

var validateChatroomCreate = function(body){
	return bb.try(function(){
		if(!body.name) throw('no name');
		if(!body.category) throw('no category');

		return body;
	});
}

module.exports.update = function(req,res){
	var chatroom = Chatroom.findOne({_id:req.query[0], deleted:false, owner:req.user}).exec();

	chatroom.then(function(chat){
		if(req.body.owner) chat.owner = req.body.owner;
		if(req.body.tags) {
			async.each(req.body.tags, function(tag){
				chat.tags.push(tag);
			})
		}

		if(req.body.name) chat.name = req.body.name;

		return chat;
	}).then(function(chat){
		chat.save().then(function(){
			return res.status(200).end();
		}).catch(function(error){
			console.log("Error: " + error.message);
			return res.status(500).json({status:500, error:'Mongo save error', message:error});
		});
	}).catch(function(error){
		console.log("Error: " + error.message);
		return res.status(500).json({status:500, error:'Mongo error', message:error});
	});
}

module.exports.delete = function(req,res){
	var chatroom = Chatroom.findOne({_id:req.params[0], deleted:false, owner:req.user}).exec();

	chatroom.then(function(chat){
		chat.deleted = true;
		chat.save().then(function(){
			return res.status(200).end();
		}).catch(function(error){
			console.log("Error: " + error.message);
			return res.status(500).json({status:500, error: 'Mongo save error', message:error});
		});
	}).catch(function(error){
		console.log("Error: " + error.message);
		return res.status(500).json({status:500, error:'Mongo error', message:error});
	});
}

module.exports.index = function(req,res){
	var chatrooms = Chatroom.find({deleted:false}).exec();

	chatrooms.then(function(chats){
		return res.json(chats);
	}).catch(function(error){
		console.log("Error: " + error.message);
		return res.status(500).json({status:500, error:"Mongo error", message:error});
	});
}

module.exports.show = function(req,res){
	var chatroom = Comment.findOne({chatroom:req.params[0], deleted:false}).populate('author chatroom').exec();

	chatroom.then(function(chatroom){
		return res.json(chatroom);
	}).catch(function(error){
		console.log("Error: " + error.message);
		return res.status(500).json({status:500, error:'Mongo error', message:error});
	});
}