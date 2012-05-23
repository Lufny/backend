var mongoose = require('mongoose'),
	sha512 = require('jshashes').sha512,
	Schema = mongoose.Schema,
	ObjectId = mongoose.ObjectId,
	notification = require("../src/class.notification.js"),
	util = require('../util.js');
var md = require('node-markdown').Markdown;

// regex for tagging: ([^@]|^)@([^@][A-Za-z0-9_!\^\-\$\.]*( |$))

//

var Posts = new Schema({
	text: {type: String},
	author: {type: Schema.ObjectId, ref: "users"},
	notifyid: [{type: Schema.ObjectId, ref: "users"}],
	date: {type: Number}, // Yeah, i know, "date" type exists, but is much more handy (at least for me) to use "number" type here
	commentcount: {type: Number, default: 0},
}, {strict: true});


exports.Posts = Posts;
