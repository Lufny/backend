var session_schema = require("../models/session.js").Sessions,
mongoose = require('mongoose'),
config = require("../config.js"),
crypto = require('crypto'),
util = require("../util.js");

function Session(session) {
	this.session = session;
	mongoose.connect(config.connection);
	this.sessionmodel = mongoose.model('sessions', session_schema);
}

Session.prototype.create = function(callback) {
	var sessname = util.random_string(),
	sessmod = new this.sessionmodel;
	sessmod.session = sessname;
	sessmod.vars = {};
	this.session.sessname = sessname;
	sessmod.save(callback);
}

Session.prototype.set = function(callback) {
	var key = this.session.key,
	val = this.session.value,
	sessname = this.session.sessname,
	nvars,	
	sessionmodel = this.sessionmodel;
	if (typeof(key) != "object") {
		key = [ key ];
		val = [ val ];
	}
	console.log(this.session.sessname);
	this.sessionmodel.find()
	.where("session", this.session.sessname)
	.run(function(err, docs) {
		docs = docs[0];
		
		(docs.vars[0] == null) ? nvars = {} : nvars = docs.vars[0]; // Mongoose, i hate u
		
		for (var n = 0; n < key.length; n++) {
			nvars[key[n]] = val[n];
		}
		
		console.log(nvars);
		sessionmodel.update({session: sessname}, {$set: {vars: nvars}}, callback);
	});
}

Session.prototype.get = function(callback) {
	this.sessionmodel.find().where("session", this.session.sessname).run(callback);
}


exports.Session = Session;
