var mongoose = require('mongoose'),
sha512 = require('jshashes').sha512,
Schema = mongoose.Schema,
ObjectId = mongoose.ObjectId,
util = require('../util.js'),
mongooseTypes = require("mongoose-types"),
Email, Url;

mongooseTypes.loadTypes(mongoose);
Email = mongoose.SchemaTypes.Email;
Url = mongoose.SchemaTypes.Url;


function checkUrl(url) {
    url = (url == "///?") ? "" : url;
    return url;
}

var Users = new Schema({
	mail: {type: Email, unique: true},
	username: {type: String, match: /^[A-Za-z0-9_!@\^\-\$\.]{0,23}$/, unique: true},
	sex: {type: String, enum: ['m', 'f']},
	password: {type: String},
	salt: {type: String},
	rname: {type: String},
	rsurname: {type: String},
	bday: {type: Date},
	language: {type: String},
	notifyid: {type: Array, default: []},
	avatar: {type: String, default: "", match: /^(http|https|ftp)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(:[a-zA-Z0-9]*)?\/?([a-zA-Z0-9\-\._\?\,'\/\\+&amp;%\$#\=~])*[^\.\,\)\(\s]$/, get: checkUrl}, // Regex from regexlib
	followers_list: [{type: Schema.ObjectId, ref: "users", default: []}],
	following_list: [{type: Schema.ObjectId, ref: "users", default: []}],
	bookmarks: [{type: Schema.ObjectId, ref: "posts", default: []}],
	is_val: {type: Boolean, default: false},
	mail_token: {type: String}
}, {strict: true});

exports.Users = Users;
