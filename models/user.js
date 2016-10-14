var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-times');
var validator = require('validator');
var validate = require('mongoose-validator');


var user = new Schema({
    username:{
        type:String,
        required:true,
        select:true,
        unique:true
    },
    password:{
        required:true,
        select:false,
        type:String
    },
    displayName:{
        type:String,
        required:false,
        select:true
    },
    email:{
        type:String,
        required:true,
        select:true,
        unique:true
    },
    deleted:{
        type: Boolean,
        default:false,
        select:true
    }
});

user.plugin(timestamps);
mongoose.model('User', user);
