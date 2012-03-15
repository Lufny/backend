var user_schema = require("../models/user.js").Users,
Session = require("./class.session.js").Session;
mongoose = require('mongoose'),
config = require("../config.js"),
crypto = require('crypto'),
util = require("../util.js");

function User(user) {
    this.user = user;
    mongoose.connect(config.connection);
    this.usermodel = mongoose.model('users', user_schema);
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
    usermod.mail_token = util.random_string();
    usermod.save(callback);
}

User.prototype.getinfo = function(callback) {
    (this.user.nickname == undefined) ? this.usermodel.findById(this.user.id).run(callback) : this.usermodel.find().where("username", this.user.nickname).run(callback);
}

User.prototype.setinfo = function(callback) {
	var obj = {};
	
	if (!util.checkValues(this.user, ["key", "value", "id"])) {
		callback({error: "Some value is missing"});
		return;
	}
	
	obj[this.user.key] = this.user.value;
	this.usermodel.update({_id: this.user.id}, {$set: obj}, callback); 
}

User.prototype.login = function(callback) {
	var usermodel = this.usermodel,
	password = this.user.password,
	username = this.user.username,
	hash, session;
	
	if (!util.checkValues(this.user, ["password", "username"])) {
		callback({error: "Some value is missing"});
		return;
	}
	
	usermodel.find().where("username", username).run(function(err, docs) {
		if (err != null || docs == null || docs.length == 0) {
			callback(false);
			return;
		}
		console.log(docs);
		hash = crypto.createHash("sha512").update(docs[0].salt+password).digest('hex');
		
		if (hash != docs[0].password) {
			callback(false);
			return;
		}
		
		session = new Session({key: "logged", value: true});
		session.create(function(err, sess) {
			if (err == null) {
				session.set(function(err, docs) {
					if (err == null) {
						callback(true, sess.session);
						return;
					}
					callback(false);
					return;
				});
			}
			callback(false);
		});
	});
}

User.prototype.addToBookmarks = function(callback) {
	var id = (typeof(this.user.id) == "string") ? this.user.id : this.user.id._id,
	pid = (typeof(this.user.id) == "string") ? mongoose.mongo.BSONPure.ObjectID.fromString(this.user.id) : this.user.id._id;
	
	if (!util.checkValues(this.user, ["id"])) {
		callback({error: "Some value is missing"});
		return;
	}
	
	this.usermodel.update({_id: id}, {$addToSet: {bookmarks:  pid}}, callback);
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
	var id = (typeof(this.user.id) == "string") ? mongoose.mongo.BSONPure.ObjectID.fromString(this.user.id) : this.user.id._id,
	uid = (typeof(this.user.uid) == "string") ? mongoose.mongo.BSONPure.ObjectID.fromString(this.user.uid) : this.user.uid._id,
	self = this;
	
	if (!util.checkValues(this.user, ["id", "uid"])) {
		callback({error: "Some value is missing"});
		return;
	}
	
	this.usermodel.update({_id: this.user.uid}, {$addToSet: {followers_list: this.user.id}}, function(err, docs) {
		if (err != null) {
			callback(false);
			return;
		}
		self.usermodel.update({_id: self.user.id}, {$addToSet: {following_list: uid}}, function(err, docs) {
			if (err != null) {
				callback(false);
				return;
			}
			callback(true);
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

exports.User = User;

