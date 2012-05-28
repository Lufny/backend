var comment_schema = require("../models/comment.js").Comments,
	post_schema = require("../models/post.js").Posts,
	user_schema = require("../models/user.js").Users,
	User = require("./class.user.js").User,
	Notification = require("./class.notification.js").Notification,
	mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId; 
	config = require("../config.js"),
	crypto = require('crypto'),
	sanitize = require("validator").sanitize,
	util = require("../util.js");


function Comment(comment) {
	this.comment = comment;
	mongoose.connect(config.connection);
	this.commentmodel = mongoose.model('comments', comment_schema);
	this.postmodel = mongoose.model('posts', post_schema);
	this.usermodel = mongoose.model('users', user_schema);
}

Comment.prototype.create = function(callback) {
	var pid, uid,
		self = this,
		commentmod = new this.commentmodel,
		date = new Date(),
        tags = util.getTags(this.comment.text),
		not;
	
	
	if (this.comment.uid && !this.comment.uid.match(/^[0-9a-f]{24}$/) || this.comment.pid && !this.comment.pid.match(/^[0-9a-f]{24}$/)) {
		callback({error: 9});
		return;
	}
	
	pid = this.comment.pid._id || mongoose.mongo.BSONPure.ObjectID.fromString(this.comment.pid);
	uid = this.comment.uid._id ||  mongoose.mongo.BSONPure.ObjectID.fromString(this.comment.uid);
	
	commentmod.text = this.comment.text;
	commentmod.author = uid;
	commentmod.post = pid;
	commentmod.date = date.getTime();
	commentmod.save(function(err, docs) {
		if (err != null) {
			callback(err, docs);
			return;
		}
		
		self.postmodel.update({_id: pid}, {$inc: {commentcount: 1}}, function(){}); // Blank callback, we don't care about the returned value
		not = new Notification({user: uid.toString(), id: pid.toString()});
        
		for (var n=0; n<tags[0].length; n++) {
			cnot = new Notification({not: {type: "tag", id: pid, uid: uid, read: false, date: date.getTime()}, where: {username: tags[0][n]}});
			cnot.add(function(){});
		}
        
        not.addPost(function(status) {
			if (status) {
				
				callback(true, 2);
				return;
			}

			not.adduser(function(status) {
				if (status) {
					
					callback(true, 3);
					return;
				}
				callback(err, docs);
			});
		});
	});
}

Comment.prototype.read = function(callback) {
	var id,
		limit = (this.comment.limit == undefined) ? 10 : this.comment.limit,
		skip = 0;
	
	
	if (this.comment.pid && !this.comment.pid.match(/^[0-9a-f]{24}$/)) {
		callback({error: 9});
		return;
	}
	
	id = this.comment.pid._id || mongoose.mongo.BSONPure.ObjectID.fromString(this.comment.pid);
	
	if (typeof(limit) == "object") {
		skip = limit[1];
		limit = limit[0];
	}
	
	this.commentmodel.find()
		.where("post", id)
		.populate("author", ["username", "_id"])
		.sort("date", "ascending")
		//.limit(limit)
		//.skip(skip)
		.run(function(err, docs) {
			var ts = [];
		
			if (err) {
				callback(err, docs);
				return;
			}
		
			// Horrible, thx mongoose
			for (var i in docs) {
				docs[i].text = util.postFilter(docs[i].text);
			}
			// -->

			callback(err, docs);
			return;
		});
}


Comment.prototype.del = function(callback) {
	var id = (typeof(this.comment.id) == "string") ? this.comment.id : this.comment.id._id,
		uid = (typeof(this.comment.uid) == "string") ? this.comment.uid : this.comment.uid._id.toString(),
		self = this;
	
	this.commentmodel.findById(id)
	.run(function(err, docs) {
		if (err != null) {
			callback(err, docs);
			return;
		}
		
		console.dir(docs);
		if (docs.author.toString() == uid) {
			self.commentmodel.remove({_id: id}, callback);
			self.postmodel.update({_id: docs.post}, {$inc: {commentcount: -1}}, function(){});
		} else {
			callback({error: 4});
		}
	});
}

Comment.prototype.count = function(callback) {
	var pid = this.comment.pid || this.comment.pid._id;
	
	this.commentmodel.count({$or: pid}, callback);
}

exports.Comment = Comment;
