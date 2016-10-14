var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-times');
var validator = require('validator');
var validate = require('mongoose-validator');


var chatroom = new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        required:true,
        select:true,
        ref:'User'
    },
    creator:{
        type:Schema.Types.ObjectId,
        required:true,
        select:true,
        ref:'User'
    },
    name:{
        type:String,
        select:true,
        required:true
    },
    category:{
        type:String,
        select:true,
        required:true,
        enum:['automotive','computers', 'gaming']
    },
    tags:[{
        type:String,
        required:false,
        select:true
    }],
    deleted:{
        type: Boolean,
        default:false,
        select:true
    }
});

chatroom.plugin(timestamps);
mongoose.model('Chatroom', chatroom);
