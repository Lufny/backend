var mongoose = require('mongoose'),
Schema = mongoose.Schema,
ObjectId = mongoose.ObjectId,
util = require('../util.js'),
md = require('node-markdown').Markdown;

// regex for tagging: ([^@]|^)@([^@][A-Za-z0-9_!\^\-\$\.]*( |$))



var PM = new Schema({
	from: {type: Schema.ObjectId, ref: "users",
	to: {type: Schema.ObjectId, ref: "users",
	text: {type: String, get: util.postFilter},
}, {strict: true});

exports.PM = PM;
