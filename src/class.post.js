var post_schema = require("../models/post.js").Posts,
User = require("./class.user.js").User,
mongoose = require('mongoose'),
ObjectId = mongoose.Types.ObjectId;
config = require("../config.js"),
crypto = require('crypto'),
notification = require("./class.notification.js").Notification,
util = require("../util.js");

function Post(post) {
	this.post = post;
	mongoose.connect(config.connection);
	this.postmodel = mongoose.model('posts', post_schema);
}


Post.prototype.write = function(callback) {
	var author = (typeof(this.post.author) == "string") ? mongoose.mongo.BSONPure.ObjectID.fromString(this.post.author) : this.post.author._id,
	postmod = new this.postmodel,
	date = new Date(),
	tags = util.getTags(this.post.text),
	cnot;
	console.log(this.post);
	//console.log(tags);
	if (!util.checkValues(this.post, ["text", "author"])) {
		callback({error: "Some value is missing"});
		return;
	}
	console.log("author "+date.getTime());
	postmod.text = this.post.text;
	postmod.author = author;
	postmod.notifyid = [author];
	postmod.date = date.getTime();
	postmod.save(function(err, docs) {
		if (err != null) {
			console.log("inerror");
			console.log(err.path);
			console.log(docs);
			callback(err, docs);
			return;
		}
		console.log("tags: "+tags);
		for (var n=0; n<tags[0].length; n++) {
			console.log("tag "+tags[0][n]);
			cnot = new notification({not: {type: "tag", id: docs._id}, where: {username: tags[0][n]}});
			cnot.add(callback);	
		}
	});
}

Post.prototype.readMain = function(limit, callback) {
	var skip = 0;
	
	if (typeof(limit) == "object") {
		skip = limit[1];
		limit = limit[0];
	}
	
	this.postmodel.find()
	.limit(limit)
	.skip(skip)
	.run(callback);
}

Post.prototype.read = function(limit, callback) {
	var skip = 0,
	author = (typeof(this.post.author) == "string") ? mongoose.mongo.BSONPure.ObjectID.fromString(this.post.author) : this.post.author._id;
	
	if (!util.checkValues(this.post, ["author"])) {
		callback({error: "Some value is missing"});
		return;
	}
	
	if (typeof(limit) == "object") {
		skip = limit[1];
		limit = limit[0];
	}
	
	this.postmodel.find()
	.where("author", author)
	.limit(limit)
	.skip(skip)
	.desc("date")
	.run(callback);
}

Post.prototype.del = function(callback) {
	var uid = (typeof(this.post.uid) == "string") ? this.post.uid : this.post.uid._id;
	
	if (!util.checkValues(this.post, ["uid", "id"])) {
		callback({error: "Some value is missing"});
		return;
	}
	
	this.postmodel.findById(this.post.id)
	.run(function(err, docs) {
		if (err != null || docs == null) {
			callback(false);
			return;
		}
		
		if (docs.author.toString() == uid) {
			docs.remove(callback);
			return;
		}
	});
}

Post.prototype.update = function(callback) {
	var uid = (typeof(this.post.uid) == "string") ? this.post.uid : this.post.uid._id,
	id = this.post.id,
	ntext = this.post.text;
	postmodel = this.postmodel;
	
	if (!util.checkValues(this.post, ["uid", "id", "text"])) {
		callback({error: "Some value is missing"});
		return;
	}
	
	postmodel.findById(this.post.id)
	.run(function(err, docs) {
		if (err != null || docs == null) {
			callback(false);
			return;
		}
		
		if (docs.author.toString() == uid) {
			postmodel.update({_id: id}, {$set: {text: ntext}}, callback);
		}
	});
}

exports.Post = Post;
