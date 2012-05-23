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
        self = this,
        sessmod = new this.sessionmodel();
    
    if (this.session.uid) { // Optimization for login
        this.sessionmodel.find({"vars.uid": this.session.uid}).run(function(err, docs) {
            
            
            
            if (docs[0]) {
                docs[0].existent = true;
                self.session.sessname = docs[0].session;
                callback(err, docs);
                return;
            }
            
            sessmod.session = sessname;
            sessmod.vars = {};
            self.session.sessname = sessname;
            sessmod.save(callback);
        });
        return;
    }
    
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
            
            
            sessionmodel.findOne({session: sessname}, function(err, docs) {
                if (err) {
                    return callback(err, docs);
                }
                
                docs.vars = nvars;
                docs.save(callback);
            });
        });
};

Session.prototype.get = function(callback) {
    this.sessionmodel.find().where("session", this.session.sessname).run(callback);
};

/*
Session.prototype.tokenset = function(callback) { // Implemented in login
    var token = util.random_string(); //
    this.session.key = "token";  //
    this.session.val = token; //
    this.set(callback); //
}
*/


Session.prototype.tokenget = function(callback) {
    this.get(function(err, docs) {
        if (err) {
            callback(err, docs);
        }
        
        callback(null, docs[0].vars[0].token);
    });
};

Session.prototype.del = function(callback) {
    console.log("asd");
    this.sessionmodel.findOne({session: this.session.sessname}).remove(callback);/*, function(err, docs) {
        if (err) {
            callback(err, docs);
            return;
        }
        
        docs.remove();
        docs.save(callback);
    });*/
};

exports.Session = Session;