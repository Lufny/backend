var post_schema = require("../models/post.js"),
	user_schema = require("../models/user.js").Users,
	User = require("./class.user.js").User,
	mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId,
	config = require("../config.js"),
	crypto = require('crypto'),
	util = require("../util.js");

function Notification(not) {
	this.not = not;
	mongoose.connect(config.connection);
	
	this.postmodel = mongoose.model('posts', post_schema.Posts); // require(blabla).Posts DID NOT WORK, WITHOUT ANY EXPLAINATION
	this.usermodel = mongoose.model('users', user_schema);
}

Notification.prototype.add = function(callback) {
	var self = this;
	if (!this.not.not.uid) {
		//console.log("oirwhjgo9ierhjgporijgoerijgeroijgs");
		this.usermodel.update(this.not.where, {$addToSet: {notifyid: this.not.not}}, callback);
	} else {
		this.usermodel.findById(this.not.not.uid)
			.run(function(err, docs) {
				console.dir(docs);
				self.not.not.username = docs.username;
				self.usermodel.update(self.not.where, {$addToSet: {notifyid: self.not.not}}, callback);
			});
	}
}

Notification.prototype.addPost = function(callback) {
	var id = this.not.id,
		uid = this.not.user,
		curr = new Date,
		tag = false, nickname, user;
	
	this.postmodel.findById(id)
	.populate("notifyid")
	.run(function(err, docs) {
		if (err != null) {
			callback(true);
			tag = true;
		}
		
		user = new User({id: uid});
		user.getinfo(function(err, infos) {
			nickname = infos[0].username;
		
			for (var n=0; n<docs.notifyid.length; n++) {
				if (tag) {
					return;
				}
				
				if (docs.notifyid[n]._id.toString() != uid) {
					docs.notifyid[n].notifyid.push({type: "post", id: id, uid: uid, nick: nickname, read: false, date: curr.getTime()});
					docs.notifyid[n].save();
				}
			}
		});
	});
	
	if (tag) {
		return;
	}
	
	callback(null);
}

Notification.prototype.adduser = function(callback) {
	var uid;
	
	if (this.not.user && !this.not.user.match(/^[0-9a-f]{24}$/)) {
		callback({error: 9});
		return;
	}	
	
	uid = (typeof(this.not.user) == "string") ? mongoose.mongo.BSONPure.ObjectID.fromString(this.not.user) : this.not.user._id;
	
	this.postmodel.update({_id: this.not.id}, {$addToSet: {notifyid: uid}}, function(err, docs) {
		if (err != null) {
			callback(true);
			
			return;
		}
		
		callback(null);
	});
}

Notification.prototype.read = function(callback) {
	var uid,
		query = this.not.query,
		global, seen, unseen, 
		act;
	
	switch (this.not.query) {
		case 'seen':
			seen = true;
			global = false;
			break;
			
		case 'unseen':
			seen = false;
			global = false;
			break;
			
		case 'global':
			global = true;
			break;
	}
	
	if (this.not.uid && !this.not.uid.match(/^[0-9a-f]{24}$/)) {
		callback({error: 9});
		return;
	}	
	
	uid = this.not.uid._id || mongoose.mongo.BSONPure.ObjectID.fromString(this.not.uid);
	
	this.usermodel.findById(uid)
	.sort("notifyid.date", "ascending")
	.run(function(err, docs) { // To rewrite with mongoose query
		var ts = [];
		if (err != null) {
			callback(err, docs);
			return;
		}
		
		if (!global) {
			for (var i in docs.notifyid) {
				if (docs.notifyid[i].read == seen) {
					ts.push(docs.notifyid[i]);
				}
			}
		} else {
			ts = docs.notifyid;
		}

		callback(null, ts);
	});
}

/*

Notification.prototype.readUnseen = function(callback) {
	var uid,
		global = this.not.global,
		act;
	
	if (this.not.uid && !this.not.uid.match(/^[0-9a-f]{24}$/)) {
		callback({error: 9});
		return;
	}	
	
	uid = this.not.uid._id || mongoose.mongo.BSONPure.ObjectID.fromString(this.not.uid);
	
	this.usermodel.find({_id: uid}, {"notifyid.read": false}).
	run(function(err, docs) {
		var ts = [];
		if (err != null) {
			callback(err, docs);
			return;
		}
		
		if (!global) {
			for (var i in docs.notifyid) {
				if (docs.notifyid[i].read == false) {
					ts.push(docs.notifyid[i]);
				}
			}
		} else {
			ts = docs.notifyid;
		}

		callback(null, ts);
	});
}*/

Notification.prototype.del = function(callback) {
	var index = this.not.index,
		uid = this.not.uid,
		see = this.not.see,
		total = (!this.not.total) ? false : true;
		usermodel = this.usermodel;
	
	usermodel.findById(uid)
	.sort("notifyid.date", "ascending")
	.run(function(err, docs) {	
		if (err != null) {
			callback(err, docs);
			return;
		}
		
		if (see) {
			for (var i in docs.notifyid) {
				if (docs.notifyid[i].date == index){
					docs.notifyid[i].read = true;
				}
				console.dir(docs.notifyid[i]);
			}
		} else {
			docs.notifyid = docs.notifyid.slice(index, index);
		}
		console.dir(docs.notifyid[index]);
		usermodel.update({_id: uid}, {$set: {notifyid: ((total) ? [ ] : docs.notifyid)}}, callback);
	});
}

exports.Notification = Notification;
