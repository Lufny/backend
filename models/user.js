var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.ObjectId,
    util = require('../util.js'),
    mongooseTypes = require("mongoose-types"),
    Email, Url;

mongooseTypes.loadTypes(mongoose);
Email = mongoose.SchemaTypes.Email;
Url = mongoose.SchemaTypes.Url;


var Users = new Schema({
	mail: {type: String, unique: true, match: /^[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i },
	username: {type: String, match: /^[A-Za-z0-9_!@\^\-\$\.]{0,23}$/, unique: true},
	sex: {type: String, enum: ['m', 'f']},
	password: {type: String},
	salt: {type: String},
	rname: {type: String, match: /^[A-Za-z]+$/},
	rsurname: {type: String, match: /^[A-Za-z]+$/},
	bday: {type: Date},
	language: {type: String, match: /^[A-Za-z]+$/},
	notifyid: {type: Array, default: []},
	avatar: {type: String, default: "http://lufny.it.cx/img/miniav.png", match: /^https?:\/\/.+$/}, // Regex from regexlib
	//avatar: {type: String, default: ""},
	followers_list: [{type: Schema.ObjectId, ref: "users", default: []}],
	following_list: [{type: Schema.ObjectId, ref: "users", default: []}],
	bookmarks: [{type: Schema.ObjectId, ref: "posts", default: []}],
	is_val: {type: Boolean, default: false},
	last_ip: {type: String},
	last_time: {type: Number, default: 0}
}, {strict: true});

exports.Users = Users;
