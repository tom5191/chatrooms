var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-times');
var validator = require('validator');
var validate = require('mongoose-validator');
var ttl = require('mongoose-ttl');


var token = new Schema({
    owner: {
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
        select: true
    },
    token:{
        type:String,
        required:true,
        select:true
    },
    uuid:{
        type:String,
        required:true,
        select:true
    },
    deleted:{
        type: Boolean,
        default:false,
        select:true
    }
});



token.plugin(timestamps);
token.plugin(ttl, {ttl: '200d'});
mongoose.model('Token', token);