var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-times');
var validator = require('validator');
var validate = require('mongoose-validator');


var comment = new Schema({
    author:{
        type:Schema.Types.ObjectId,
        ref:'User',
        select:true,
        required:true
    },
    text:{
        require:true,
        type:String,
        select:true
    },
    chatroom:{
        type:Schema.Types.ObjectId,
        ref:'Chatroom',
        required:true,
        select:true
    },
    deleted:{
        type: Boolean,
        default:false,
        select:true
    }
});

comment.plugin(timestamps);
mongoose.model('Comment', comment);
