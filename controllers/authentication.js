var bb = require('bluebird');
var mongoose = require('mongoose');
	mongoose.Promise = bb;
var Authentication = mongoose.model('Authentication');
var User = mongoose.model('User');
var Token = mongoose.model('Token');
var BcryptPromise = require('bcrypt-as-promised');
var _ = require('lodash');
var jwt = require('jwt-simple');
var utils = require('./../lib/util');
var uuid = require('node-uuid');
var config = require('./../app').config;
var pubnub = require('./../app').pubnub;


module.exports.basicAuth = function(req,res,next){
	var identifier = req.body.identifier;
	var password = req.body.secret;

	if(!identifier || !password) return res.status(400).json({status:400, error:'Missing field(s)', message:"Please enter an identifier and secret"});

	var user = User
				.findOne({ deleted:false, $or: [{username: identifier.toLowerCase()}, { email:identifier.toLowerCase()}, { fbId:identifier} ] })
				.select("+password")
				.exec();

	user.then(function(user){
		if(!user) return res.status(401).json({status:401, error:'Login failure', message:"No email, username, or Facebook Id found"});
		BcryptPromise
			.compare(password, user.password)
			.then(function(){
				req.user = user._id;
				return next();
			}).catch(function(error){
				return res.status(401).json({status:401, error:"Bad login", message:"Username or password is incorrect"});
			});			
	}).catch(function(error){
		return res.status(500).json({status:500, error:"Mongo error", message:error});
	});
}


module.exports.bearerAuth = function(req,res,next){
	var bearer = req.headers['authorization'];

	if(bearer.length < 8) return next({status:401, type:'Not authenticated', error:'Bad bearer token', message:'"Bearer " is being set, but no token has been passed'});

	var decoded = jwt.decode(bearer, config.app.JWTsecret);
	var hashedToken = utils.sha3(decoded.access_token);

	var auth = Authentication.findOne({hashedToken: hashedToken}).exec();

	auth.then(function(hash){
		if(!hash) return next({status:401, type:'Not authenticated', error:'Bad bearer token', message:'Please supply a valid bearer token'});

		// If the value from the key (which uses the actual token) is the same as the decoded token id, we're verified
		if(hash.token  === decoded.token_id) {
			Authentication.findOneAndUpdate({hashedToken:hashedToken},{lastUsed:_.now()}).exec();
			req.user = hash.owner;
			return next();
		} else {        
			return next();
		}
	}).catch(function(error){
		return res.status(500).json({status:500, error:'Mongo error', message:error});
	});
}

// Generate a token
module.exports.accessToken = function(req, res, next) {
    // Create a UUID token & then hash it
    var token = uuid.v4();

    var hashedToken = utils.sha3(token);

    // Create a unique id for each token
    var tokenId = uuid.v4();

    // Set the number of seconds the token should last (this is set to 200 days)
    var expirationInSeconds = 21600000;

    var auth = new Authentication({
        owner:req.user,
        lastUsed:_.now(),
        hashedToken:hashedToken,
        token:tokenId
    });

    auth.save().then(function(){
        // Here we map an access token to another UUID so we can delete tokens RESTfully without directly referencing them
        var newToken = new Token({
            owner:req.user,
            token:token,
            uuid:tokenId
        });
        newToken.save().then(function(){
            User.findOneAndUpdate({_id: req.user},{$push:{token:tokenId}}).exec();          
                // Create a JWT payload. Note: this is not sent to the client in cleartext, but rather encoded according to the JWT spec
                var payload = {
                    access_token: token,
                    token_id: tokenId,
                    user_id: req.user
                };

                // Encode the payload with the secret
                var encoded = jwt.encode(payload, config.app.JWTsecret);

                // // Register the encoded token with PubNub to grant access to their user channel
                pubnub.grant({
                    channel: req.user,
                    auth_key: encoded,
                    read: true,
                    write: false,
                    ttl: expirationInSeconds,
                    callback: function(m){}
                });

                // Register the encoded token with PubNub to grant access to the master channel
                pubnub.grant({
                    channel: 'master',
                    auth_key: encoded,
                    read: true,
                    write: true,
                    ttl: expirationInSeconds,
                    callback:function(m){}
                });

                // Create the response object (which will be encoded into JSON)
                var response = {
                    accessToken: encoded,
                    userId: req.user,
                    tokenType: 'bearer',
                    expiresIn: expirationInSeconds
                };

                return res.json(response);
        }).catch(function(error){
            console.log(error);
            return res.status(500).json({status:500, error:'server error', message:error.message ? error.message : error});
        });  
    }).catch(function(error){
        console.log(error);
        return res.status(200).json({status:500, error:'server error', message:error.message ? error.message : error})
    });
};