var session_schema = require("../models/session.js").Sessions,
  user_schema = require("../models/user.js").Users,
  mongoose = require('mongoose'),
  config = require("../config.js"),
  crypto = require('crypto'),
  util = require("../util.js");

function Session(session) {
  this.session = session;
  mongoose.connect(config.connection);
  this.usermodel = mongoose.model('users', user_schema);
  this.sessionmodel = mongoose.model('sessions', session_schema);
}

Session.prototype.create = function(callback) {
  var sessname = util.random_string(),
    self = this,
    sessmod = new this.sessionmodel();
  
  sessmod.owner = this.session.uid;
  sessmod.session = sessname;
  sessmod.vars = {};
  this.session.sessname = sessname;
  sessmod.save(callback);
};

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
  
  this.sessionmodel.findOne()
    .where("session", this.session.sessname)
    .run(function(err, docs) {
      var n;
      if (err) {
        return callback(err, docs);
      }
      
      nvars = (docs.vars[0] == null) ?  {} : docs.vars[0]; // Mongoose, i hate ya
      
      for (n = 0; n < key.length; n++) {
        nvars[key[n]] = val[n];
      }
      
      docs.vars = nvars;
      docs.save(callback);
    });
};

Session.prototype.get = function(callback) {
  this.sessionmodel.findOne()
    .where("session", this.session.sessname)
    .populate("owner", ["username", "_id"])
    .run(callback);
};

Session.prototype.tokenget = function(callback) {
  this.get(function(err, docs) {
    if (err) {
      callback(err, docs);
    }
    
    callback(null, docs.vars[0].token);
  });
};

Session.prototype.del = function(callback) {
  console.log("asd");
  this.sessionmodel.findOne({session: this.session.sessname}).remove(callback);
};

exports.Session = Session;