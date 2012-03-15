var comment_schema = require("../models/comment.js").Comments,
User = require("./class.user.js").User,
Notification = require("./class.notification.js").Notification,
mongoose = require('mongoose'),
ObjectId = mongoose.Types.ObjectId; 
config = require("../config.js"),
crypto = require('crypto'),
util = require("../util.js");


function Comment(comment) {
	this.comment = comment;
	mongoose.connect(config.connection);
	this.commentmodel = mongoose.model('comments', comment_schema);
}

Comment.prototype.create = function(callback) {
	var pid = (typeof(this.comment.pid) == "string") ? mongoose.mongo.BSONPure.ObjectID.fromString(this.comment.pid) : this.comment.pid._id,
	uid = (typeof(this.comment.uid) == "string") ? mongoose.mongo.BSONPure.ObjectID.fromString(this.comment.uid) : this.comment.uid._id,
	commentmod = new this.commentmodel,
	date = new Date();
	not;
	
	commentmod.text = this.comment.text;
	commentmod.author = uid;
	commentmod.post = pid;
	commentmod.date = date.getTime();
	commentmod.save(function(err, docs) {
		if (err != null) {
			console.log("1");
			callback(false,1);
			return;
		}
		
		not = new Notification({user: uid.toString(), id: pid.toString()});
		not.addPost(function(status) {
			if (!status) {
				console.log("2");
				callback(false, 2);
				return false;
				console.log("asdddd");
			}

			not.adduser(function(status) {
				if (!status) {
					console.log("3");
					callback(false, 3);
					return false;
				}
				callback(true);
			});
		});
	});
}

Comment.prototype.read = function(callback) {
	var id = (typeof(this.comment.pid) == "string") ? mongoose.mongo.BSONPure.ObjectID.fromString(this.comment.pid) : this.comment.pid._id,
	limit = (this.comment.limit == undefined) ? 10 : this.comment.limit,
	skip = 0;
	
	if (typeof(limit) == "object") {
		skip = limit[1];
		limit = limit[0];
	}
	
	this.commentmodel.findById(id)
	.where("post", id)
	.limit(limit)
	.skip(skip)
	.run(callback);
}


Comment.prototype.del = function(callback) {
	var id = (typeof(this.comment.id) == "string") ? this.comment.id : this.comment.id._id,
	uid = (typeof(this.comment.uid) == "string") ? this.comment.uid : this.comment.uid._id.toString();
	this.commentmodel.findById(id)
	.run(function(err, docs) {
		if (err != null) {
			callback(true);
			return;
		}
		
		if (docs.author.toString() == uid) {
			docs.remove(callback);
		}
	});
}

exports.Comment = Comment;
