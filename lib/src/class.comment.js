var comment_schema = require("../models/comment.js").Comments,
  post_schema = require("../models/post.js").Posts,
  user_schema = require("../models/user.js").Users,
  User = require("./class.user.js").User,
  Notification = require("./class.notification.js").Notification,
  mongoose = require('mongoose'),
  ObjectId = mongoose.Types.ObjectId,
  config = require("../config.js"),
  crypto = require('crypto'),
  sanitize = require("validator").sanitize,
  util = require("../util.js");


function Comment(comment) {
  this.comment = comment;
  mongoose.connect(config.connection);
  this.commentmodel = mongoose.model('comments', comment_schema);
  this.postmodel = mongoose.model('posts', post_schema);
  this.usermodel = mongoose.model('users', user_schema);
}

Comment.prototype.create = function(callback) {
  var pid, uid,
    self = this,
    commentmod = new this.commentmodel(),
    date = new Date(), n, cnot,
    blank = function() {},
    tags = util.getTags(this.comment.text),
    not;
  
  if ((this.comment.uid && !this.comment.uid.match(/^[0-9a-f]{24}$/)) || (this.comment.pid && !this.comment.pid.match(/^[0-9a-f]{24}$/)))
    return callback({error: 6});
  
  pid = this.comment.pid._id || mongoose.mongo.BSONPure.ObjectID.fromString(this.comment.pid);
  uid = this.comment.uid._id ||  mongoose.mongo.BSONPure.ObjectID.fromString(this.comment.uid);
  
  commentmod.text = this.comment.text;
  commentmod.author = uid;
  commentmod.post = pid;
  commentmod.date = date.getTime();
  commentmod.save(function(err, docs) {
    if (err != null) {
      callback(err, docs);
      return;
    }
    
    self.postmodel.findById(pid, function(err, docs) {
      if (!err) {
        docs.commentcount++; 
        docs.save();
      }
    });
    not = new Notification({user: uid.toString(), id: pid.toString()});
    
    for (n=0; n<tags.length; n++) {
      cnot = new Notification({not: {type: "tag", id: pid, uid: uid, read: false, date: date.getTime()}, where: {username: tags[n]}});
      cnot.add(blank);
    }
    
    not.addPost(function(status) {
      if (status) {
        
        return callback(true, 2);
      }

      not.adduser(function(status) {
        if (status) {
          return callback(true, 3);
        }
        
        callback(err, docs);
      });
    });
  });
};

Comment.prototype.read = function(callback) {
  var id,
    limit = (this.comment.limit == undefined) ? 10 : this.comment.limit,
    skip = 0;
  
  
  if (this.comment.pid && !this.comment.pid.match(/^[0-9a-f]{24}$/)) {
    callback({error: 6});
    return;
  }
  
  id = this.comment.pid._id || mongoose.mongo.BSONPure.ObjectID.fromString(this.comment.pid);
  
  if (typeof(limit) == "object") {
    skip = limit[1];
    limit = limit[0];
  }
  
  this.commentmodel.find()
    .where("post", id)
    .populate("author", ["username", "_id"])
    .sort("date", "ascending")
    .run(function(err, docs) {
      var i;
      
      if (err) {
        callback(err, docs);
        return;
      }
    
      // Horrible, thx mongoose
      for (i=0; i < docs.length; i++) {
        docs[i].text = util.postFilter(docs[i].text);
      }
      // -->

      return callback(err, docs);
    });
};


Comment.prototype.del = function(callback) {
  var id = (typeof(this.comment.id) == "string") ? this.comment.id : this.comment.id._id,
    uid = (typeof(this.comment.uid) == "string") ? this.comment.uid : this.comment.uid._id.toString(),
    self = this;
  
  this.commentmodel.findById(id, function(err, docs) {
    if (err != null) {
      return callback(err, docs);
    }
    
    if (docs.author.toString() == uid) {
      self.commentmodel.remove({_id: id}, callback);
      self.postmodel.findById(docs.post, function(err, docs){ 
        if (!err) {
          docs.commentcount--;
          docs.save();
        }
      });
    } else {
      callback({error: 4});
    }
  });
};

Comment.prototype.count = function(callback) {
  var pid = this.comment.pid || this.comment.pid._id;
  
  this.commentmodel.count({$or: pid}, callback);
};

exports.Comment = Comment;
