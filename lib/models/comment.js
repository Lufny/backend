var mongoose = require('mongoose'),
sha512 = require('jshashes').sha512,
Schema = mongoose.Schema,
ObjectId = mongoose.ObjectId,
util = require('../util.js');
var md = require('node-markdown').Markdown;


var Comments = new Schema({
	text: {type: String},
	author: {type: Schema.ObjectId, ref: "users"},
	post: {type: Schema.ObjectId, ref: "posts"},
	date: {type: Number} // if you are wondering why i use "number" here, just read post schema
}, {strict: true});

exports.Comments = Comments;
