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
  var self = this,
    not = this.not.not,
    where = this.not.where,
    updater = function(err, docs) {
      if (err) {
        return callback(err, docs);
      }
      
      docs.forEach(function(x) {
        x.notifyid.push(self.not.not);
      });
      
      callback(err, docs);
    };
    
  if (!this.not.not.uid) {
    //console.log("oirwhjgo9ierhjgporijgoerijgeroijgs");
    this.usermodel.find(where, updater);
  } else {
    this.usermodel.find(this.not.not.uid, function(err, docs) {
      if (err) {
        return callback(err, docs);
      }
      
      not.username = docs.username;
      self.usermodel.find(where, updater);
    });
  }
};

Notification.prototype.addPost = function(callback) {
  var id = this.not.id,
    uid = this.not.user,
    curr = new Date(),
    n,
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
      if (err) {
        callback(err, docs);
      }
      
      nickname = infos[0].username;
    
      for (n=0; n<docs.notifyid.length; n++) {
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
};

Notification.prototype.adduser = function(callback) {
  var uid;
  
  if (this.not.user && !this.not.user.match(/^[0-9a-f]{24}$/)) {
    callback({error: 6});
    return;
  }  
  
  uid = (typeof(this.not.user) == "string") ? mongoose.mongo.BSONPure.ObjectID.fromString(this.not.user) : this.not.user._id;
  
  this.postmodel.findById(this.not.id, function(err, docs) {
    if (err) {
      return callback(err, docs);
    }
    
    docs.notifyid.push(uid);
    docs.save(function(err) {
      if (err != null) {
        return callback(true);
      }
      
      callback(null);
    });
  });
};

Notification.prototype.read = function(callback) {
  var uid,
    query = this.not.query,
    global, seen, i;
  
  switch (query) {
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
    callback({error: 6});
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
      for (i=0; i<docs.notifyid.length; i++) {
        if (docs.notifyid[i].read == seen) {
          ts.push(docs.notifyid[i]);
        }
      }
    } else {
      ts = docs.notifyid;
    }

    callback(null, ts);
  });
};

Notification.prototype.del = function(callback) {
  var index = this.not.index,
    uid = this.not.uid,
    see = this.not.see,
    total = this.not.total, i,
    usermodel = this.usermodel;
  
  usermodel.findById(uid)
  .sort("notifyid.date", "ascending")
  .run(function(err, docs) {  
    if (err != null) {
      callback(err, docs);
      return;
    }
    
    if (see) {
      for (i=0; i<docs.notifyid.length; i++) {
        if (docs.notifyid[i].date == index){
          docs.notifyid[i].read = true;
        }
      }
    } else {
      docs.notifyid = docs.notifyid.splice(index, 1);
    }
    
    if (total) {
      docs.notifyid = [];
    }
    
    docs.save(callback);
  });
};

exports.Notification = Notification;
