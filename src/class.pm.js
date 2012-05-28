var pm_schema = require("../models/pm.js").PM,
user_schema = require("../models/user.js").Users,
mongoose = require('mongoose'),
ObjectId = mongoose.Types.ObjectId,
config = require("../config.js"),
util = require("../util.js");

function PM(pm) {
	this.pm = pm;
	mongoose.connect(config.connection);
	this.pmmodel = mongoose.model('pm', pm_schema);
	this.usermodel = mongoose.model('users', user_schema);
}

PM.prototype.write = function(callback) {
	var from = this.pm.from._id || mongoose.mongo.BSONPure.ObjectID.fromString(this.pm.from),
	to = this.pm.to._id || mongoose.mongo.BSONPure.ObjectID.fromString(this.pm.to),
	text = this.pm.text,
	pmmod = new this.pmmodel;
	
	pmmod.to = to;
	pmmod.from = from;
	pmmod.text = text;
	pmmod.read = false;
	pmmod.save(callback);
}

PM.prototype.read = function(callback) {
	var uid = this.pm.uid._id || mongoose.mongo.BSONPure.ObjectID.fromString(this.pm.uid);
	
	this.pmmodel.find()
	.or([{"from": uid}, {"to": uid}])
	.populate("to", ['username'])
	.populate("from", ['username'])
	.run(callback);
}

exports.PM = PM;