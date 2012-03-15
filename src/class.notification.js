var post_schema = require("../models/post.js").Posts,
user_schema = require("../models/user.js").Users,
User = require("./class.user.js").User,
mongoose = require('mongoose'),
ObjectId = mongoose.Types.ObjectId; 
config = require("../config.js"),
crypto = require('crypto'),
util = require("../util.js");

function Notification(not) {
	this.not = not;
	mongoose.connect(config.connection);
	this.postmodel = mongoose.model('posts', post_schema);
	this.usermodel = mongoose.model('users', user_schema);
}

Notification.prototype.add = function(callback) {
	this.usermodel.update(this.not.where, {$addToSet: {notifyid: this.not.not}}, callback);
}

Notification.prototype.addPost = function(callback) {
	var id = this.not.id,
	uid = this.not.user,
	tag = false, nickname, user;
	this.postmodel.findById(id)
	.populate("notifyid")
	.run(function(err, docs) {
		if (err != null) {
			callback(false);
			tag = true;
		}
		
		user = new User({id: uid});
		user.getinfo(function(err, infos) {
			nickname = infos.username;
		
			for (var n=0; n<docs.notifyid.length; n++) {
				if (tag) {
					return;
				}
				if (docs.notifyid[n]._id.toString() != uid) {
					docs.notifyid[n].notifyid.push({type: "post", id: id, uid: uid, nick: nickname});
					docs.notifyid[n].save();
				}
	
			}
		});
	});
	
	if (tag) {
		return;
	}
	
	callback(true);
}

Notification.prototype.adduser = function(callback) {
	var uid = (typeof(this.not.user) == "string") ? mongoose.mongo.BSONPure.ObjectID.fromString(this.not.user) : this.not.user._id;
	this.postmodel.update({_id: this.not.id}, {$addToSet: {notifyid: uid}}, function(err, docs) {
		if (err != null) {
			callback(false);
			console.log("--:D--");
			return;
		}
				console.log("--D:--");
		callback(true);
	});
}

Notification.prototype.read = function(callback) {
	this.usermodel.findById(this.not.uid)
	.run(function(err, docs) {
		if (err != null) {
			callback(false);

			return;
		}

		callback(true, docs.notifyid);
	});
}

Notification.prototype.del = function(callback) {
	var index = this.not.index,
	uid = this.not.uid,
	total = (this.not.total != undefined) ? true : false;
	usermodel = this.usermodel;
	
	usermodel.findById(uid)
	.run(function(err, docs) {	
		if (err != null) {
			callback(false);
			return;
		}

		docs.notifyid = docs.notifyid.slice(index, index);
		usermodel.update({_id: uid}, {$set: {notifyid: ((total) ? [ ] : docs.notifyid)}}, callback);
	});
}

exports.Notification = Notification;
