var user_schema = require("../models/user.js").Users,
    post_schema = require("../models/post.js"),
    Session = require("./class.session.js").Session,
    mongoose = require('mongoose'),
    config = require("../config.js"),
    crypto = require('crypto'),
    util = require("../util.js");

var FLOOD_LAP = 7000;

function User(user) {
    this.user = user;
	this.perminfo = ['mail', 'username', 'sex', 'rname', 'rsurname', 'bday', 'language', 'followers_list', 'following_list', 'bookmarks', 'avatar'];
    this.permsetinfo = ['mail', 'username', 'sex', 'rname', 'rsurname', 'bday', 'language', 'avatar'];
	mongoose.connect(config.connection);
    this.usermodel = mongoose.model('users', user_schema);
	this.postmodel = mongoose.model('posts', post_schema.Posts);
}

User.prototype.register = function(callback) {
    var usermod = new this.usermodel,
		keys = ["mail", "username", "password", "rname", "rsurname", "bday", "language"];
	
	if (!util.checkValues(this.user, keys)) {
		callback({error: "Some value is missing"});
		return;
	}
	
    usermod.mail = this.user.mail;
    usermod.username = this.user.username;
    usermod.salt = util.random_string(6);
    usermod.password = crypto.createHash("sha512").update(usermod.salt+this.user.password).digest('hex');
    usermod.rname = this.user.rname;
    usermod.rsurname = this.user.rsurname;
    usermod.bday = util.toDate(this.user.bday);
    usermod.language = this.user.language;
    //if (this.user.validate) usermod.is_val = true;
    usermod.save(callback);
}

User.prototype.getinfo = function(callback) {
	var query = (this.user.id) ? {"_id": this.user.id} : {"username": this.user.username};
    this.usermodel.find(query, this.perminfo)
		.populate('bookmarks', ['text', 'author', '_id'])
		.populate('following_list', ['_id', 'username'])
		.populate('followers_list', ['_id', 'username'])
		.run(callback);
}


User.prototype.setinfo = function(callback) {
	var obj = {}, self = this;
	
	if (!util.inArray(this.user.key, this.permsetinfo)) {
		callback({error: 3}, undefined);
		return;
	}
	
	obj[this.user.key] = this.user.value;
	//this.usermodel.update({_id: this.user.id}, {$set: obj}, callback); 
	this.usermodel.findById(this.user.id, function(err, docs) {
		docs[self.user.key] = self.user.value;
		docs.save(callback);
	});
}

User.prototype.login = function(callback) {
	var usermodel = this.usermodel,
	password = this.user.password,
	username = this.user.username,
	hash, session;
	
	if (!util.checkValues(this.user, ["password", "username"])) {
		callback(true, {error: "Some value is missing"});
		return;
	}
	
	usermodel.find().where("username", username).run(function(err, docs) {
		if (err != null || docs == null || docs.length == 0) {
			callback(true, 1);
			return;
		}
		console.log(docs);
		hash = crypto.createHash("sha512").update(docs[0].salt+password).digest('hex');
		
		if (hash != docs[0].password) {
			callback(true, 2);
			return;
		}
		
		session = new Session({key: ["logged", "uid", "token"], value: [true, docs[0]._id.toString(), util.random_string()], uid: docs[0]._id.toString()}); // To edit using hashes
		session.create(function(err, sess) {
			if (sess[0]) 
				sess = sess[0];
			
			if (sess.existent) {
				callback(false, [sess.session, docs[0]._id.toString()]);
				return;
			}
			
			if (err == null) {
				session.set(function(err) {
					if (err == null) {
						callback(false, [sess.session, docs[0]._id.toString()]);
						return;
					}
					
					callback(true, 3);
					return;
				});
			}
		});
	});
}

User.prototype.like = function(callback) {
    var pid, id;
    
    if (this.user.pid && !this.user.pid.match(/^[0-9a-f]{24}$/) || this.user.id && !this.user.id.match(/^[0-9a-f]{24}$/)) {
		callback({error: 9});
		return;
	}
    
    pid = this.user.pid._id || mongoose.mongo.BSONPure.ObjectID.fromString(this.user.pid);
    id = this.user.id._id || mongoose.mongo.BSONPure.ObjectID.fromString(this.user.id);
    
    this.usermodel.findById(id, function(err, docs) {
        if (err) {
            callback(err, docs);
            return;
        }
        
        if (docs.unlike.indexOf(pid) < 0) {
            docs.like.push(pid);
            docs.save(callback);
        } else {
            callback({error: 10});
        }
    });
}

User.prototype.unlike = function(callback) {
    var pid, id;
    
    if (this.user.pid && !this.user.pid.match(/^[0-9a-f]{24}$/) || this.user.id && !this.user.id.match(/^[0-9a-f]{24}$/)) {
		callback({error: 9});
		return;
	}
    
    pid = this.user.pid._id || mongoose.mongo.BSONPure.ObjectID.fromString(this.user.pid);
    id = this.user.id._id || mongoose.mongo.BSONPure.ObjectID.fromString(this.user.id);
    
    this.usermodel.findById(id, function(err, docs) {
        if (err) {
            callback(err, docs);
            return;
        }
        
        if (docs.like.indexOf(pid) < 0) {
            docs.unlike.push(pid);
            docs.save(callback);
        } else {
            callback({error: 10});
        }
    });
}

User.prototype.addBookmark = function(callback) {
	var id = (typeof(this.user.id) == "string") ? this.user.id : this.user.id._id,
		pid;
	
	if (this.user.pid && !this.user.pid.match(/^[0-9a-f]{24}$/)) {
		callback({error: 9});
		return;
	}
	
	pid = (typeof(this.user.pid) == "string") ? mongoose.mongo.BSONPure.ObjectID.fromString(this.user.pid) : this.user.pid._id;
	
	if (!util.checkValues(this.user, ["id"])) {
		callback({error: "Some value is missing"});
		return;
	}
	
	this.usermodel.update({_id: id}, {$addToSet: {bookmarks: pid}}, callback);
}

User.prototype.delBookmark = function(callback) {
	var index = parseInt(this.user.index),
	uid = this.user.id,
	usermodel = this.usermodel;
	
	usermodel.findById(uid)
	.run(function(err, docs) {	
		if (err != null) {
			callback(false);
			return;
		}
		
		docs.bookmarks = docs.bookmarks.slice(index, index);
		console.log(docs.bookmarks);
		usermodel.update({_id: uid}, {$set: {bookmarks: docs.bookmarks}}, callback);
	});
}

User.prototype.setGravatar = function(callback) {
	var hash,
	self = this;
	
	this.getinfo(function(err, docs) {
		if (err != null) {
			callback(false);
			return;
		}
		
		hash = crypto.createHash("md5").update(docs.mail.replace(" ", "").toLowerCase()).digest('hex');
		self.user.key = "avatar";
		self.user.value = "http://www.gravatar.com/avatar/"+hash;
		self.setinfo(callback);
	});
}

// Follower: id
User.prototype.addFollower = function(callback) {
	var id,
		uid,
		self = this,
		follow_list, idx,
		inserted = false;

	if (this.user.id && !this.user.id.match(/^[0-9a-f]{24}$/) || this.user.uid && !this.user.uid.match(/^[0-9a-f]{24}$/)) {
		callback({error: 9});
		return;
	}
	
	if (!util.checkValues(this.user, ["id", "uid"])) {
		callback({error: "Some value is missing"});
		return;
	}
	
	id = (typeof(this.user.id) == "string") ? mongoose.mongo.BSONPure.ObjectID.fromString(this.user.id) : this.user.id._id;
	uid = (typeof(this.user.uid) == "string") ? mongoose.mongo.BSONPure.ObjectID.fromString(this.user.uid) : this.user.uid._id;
	
	this.getFollowing(function(err, docs) {
		if (err) {
			callback(err, docs);
			return;
		} 
		
		if (docs.following_list.indexOf(uid) >= 0) {
			idx = docs.following_list.indexOf(uid);
			docs.following_list = docs.following_list.slice(idx, idx);
			self.usermodel.update({_id: id}, {following_list: docs.following_list}, function(err, docs) {
				console.log();
				if (err) {
					callback(err, docs);
					return;
				}
				
				self.id = uid;
				self.getFollowers(function(err, docs) {
					if (err) {
						callback(err, docs);
						return;
					}
					
					idx = docs.followers_list.indexOf(id);
					docs.followers_list = docs.followers_list.slice(idx, idx);
					self.usermodel.update({_id: uid}, {following_list: docs.followers_list}, callback);
					return;
				});
			});
		}
		
		self.usermodel.update({_id: uid}, {$addToSet: {followers_list: id}}, function(err, docs) {
			console.log("asd");
			if (err != null) {
				callback(err, docs);
				return;
			}

			self.usermodel.update({_id: id}, {$addToSet: {following_list: uid}}, callback);
		});
	});
}

User.prototype.getFollowers = function(callback) {
	if (!util.checkValues(this.user, ["id"])) {
		callback({error: "Some value is missing"});
		return;
	}
	
	this.usermodel.findById(this.user.id)
	.only("followers_list")
	.run(callback);
}

User.prototype.getFollowing = function(callback) {
	if (!util.checkValues(this.user, ["id"])) {
		callback({error: "Some value is missing"});
		return;
	}
	this.usermodel.findById(this.user.id)
	.only("following_list")
	.run(callback);
}

User.prototype.updateProfile = function(callback) {
	var current = new Date,
		id = this.user.id._id || this.user.id,
		ip = this.user.ip;
	
	this.usermodel.update({_id: id}, {$set: {last_time: current.getTime(), last_ip: ip}}, callback);
}

User.prototype.canPost = function(callback) {
	var current = new Date,
		id = id = this.user.id._id || this.user.id;

	this.usermodel.findById(id)
		.run(function(err, docs) {
			if (err) {
				callback(err, docs);
				return;
			}
			
			callback(docs.last_time == 0 || current - docs.last_time >= FLOOD_LAP);
		});
}

/*
var user = new User({uid: "4f4e135d32c5bac609000001", id: "4f4516a1ce9f7bd709000001"});
user.getFollowing(function(err, docs) {
	console.log(docs);
});*/
// stoke
// {}
exports.User = User;

