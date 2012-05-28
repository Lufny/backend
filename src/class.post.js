var post_schema = require("../models/post.js").Posts,
    user_schema = require("../models/user.js").Users,
    User = require("./class.user.js").User,
    mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    config = require("../config.js"),
    crypto = require('crypto'),
    Notification = require("./class.notification.js").Notification,
    sanitize = require("validator").sanitize,
    util = require("../util.js");

function Post(post) {
    this.post = post;
    mongoose.connect(config.connection);
    this.postmodel = mongoose.model('posts', post_schema);
    this.usermodel = mongoose.model('users', user_schema);
}


Post.prototype.write = function(callback) {
    var author,
        postmod = new this.postmodel(),
        date = new Date(),
        tags = util.getTags(this.post.text),
        self = this,
        n,
        blank = function() {},
        cnot;

    if (this.post.author && !this.post.author.match(/^[0-9a-f]{24}$/)) {
        callback({error: 9});
        return;
    }    
    
    author = this.post.author._id || mongoose.mongo.BSONPure.ObjectID.fromString(this.post.author);
    
    postmod.text = this.post.text;
    postmod.author = author;
    postmod.notifyid = [author];
    postmod.date = date.getTime();
    postmod.save(function(err, docs) {
        if (err != null) {
            callback(err, docs);
            return;
        }
        
        console.dir(tags);
        
        for (n=0; n<tags[0].length; n++) {
            cnot = new Notification({not: {type: "tag", id: docs._id, uid: author, read: false, date: date.getTime()}, where: {username: tags[0][n]}});
            cnot.add(blank);
        }
        
        callback(err, docs);
    });
};

Post.prototype.readMain = function(callback) {
    var skip = 0,
        i,
        limit = this.post.limit;
    
    if (typeof(limit) == "object") {
        skip = limit[1];
        limit = limit[0];
    }
    
    this.postmodel.find({}, {notifyid: 0})
    .limit(limit)
    .skip(skip)
    .desc("date")
    .populate('author', ['username'])
    .run(function(err, docs) {
            var keys = {text: 1, author: 1, notifyid: 1, date: 1, commentcount: 1},
            tmpobj = {}, ts = [];
        
        if (err) {
            callback(err, docs);
            return;
        }
        
        
        // Horrible, thx mongoose
        for (i in docs) {
            ts.push({
                text: util.postFilter(docs[i].text),
                author: docs[i].author,
                notifyid: docs[i].notifyid,
                date: docs[i].date,
                commentcount: docs[i].commentcount,
                raw: docs[i].text,
                _id: docs[i]._id
            });
        }
        // -->
        
        
        
        callback(err, ts);
        return;
    });
};

Post.prototype.read = function(callback) {
    var skip = 0,
        limit = this.post.limit,
        i,
        author;

    if (this.post.author && !this.post.author.match(/^[0-9a-f]{24}$/)) {
        callback({error: 9});
        return;
    }        
    
    if (!util.checkValues(this.post, ["author"])) {
        callback({error: "Some value is missing"});
        return;
    }
    
    author = (typeof(this.post.author) == "string") ? mongoose.mongo.BSONPure.ObjectID.fromString(this.post.author) : this.post.author._id;
    
    if (typeof(limit) == "object") {
        skip = limit[1];
        limit = limit[0];
    }
    
    this.postmodel.find()
        .where("author", author)
        .limit(limit)
        .skip(skip)
        .desc("date")
        .populate('author', ['username'])
        .run(function(err, docs) {
            var ts = [];
            if (err) {
                callback(err, docs);
                return;
            }
            
            for (i in docs) {
                ts.push({
                    text: util.postFilter(docs[i].text),
                    author: docs[i].author,
                    notifyid: docs[i].notifyid,
                    date: docs[i].date,
                    commentcount: docs[i].commentcount,
                    raw: docs[i].text,
                    _id: docs[i]._id
                });
            }
        
            
            
            callback(err, ts);
        });
};

Post.prototype.readOne = function(callback) {
    var pid;
    
    if (this.post.pid && !this.post.pid.match(/^[0-9a-f]{24}$/)) {
        callback({error: 9});
        return;
    }
    
    pid = this.post.pid._id || mongoose.mongo.BSONPure.ObjectID.fromString(this.post.pid);
    
    this.postmodel.findById(pid)
        .populate('author', ['username'])
        .run(function(err, docs) {
            var ts;
            if (err || !docs) {
                callback(err, docs);
                return;
            }
        
            
        
            ts = {
                text: util.postFilter(docs.text),
                author: docs.author,
                notifyid: docs.notifyid,
                date: docs.date,
                commentcount: docs.commentcount,
                raw: docs.text,
                _id: docs._id
            };
        
            
            
            callback(err, ts);
        });    
};

Post.prototype.del = function(callback) {
    var uid = (typeof(this.post.uid) == "string") ? this.post.uid : this.post.uid._id;
    
    if (!util.checkValues(this.post, ["uid", "id"])) {
        callback({error: "Some value is missing"});
        return;
    }
    
    this.postmodel.findById(this.post.id)
    .run(function(err, docs) {
        if (err != null || docs == null) {
            callback(err, docs);
            return;
        }
        
        if (docs.author.toString() == uid) {
            
            docs.remove(callback);
            return;
        }
    });
};

Post.prototype.update = function(callback) {
    var uid = (typeof(this.post.uid) == "string") ? this.post.uid : this.post.uid._id,
        id = this.post.id,
        ntext = this.post.text,
        postmodel = this.postmodel;
    
    if (!util.checkValues(this.post, ["uid", "id", "text"])) {
        callback({error: "Some value is missing"});
        return;
    }
    
    postmodel.findById(this.post.id)
    .run(function(err, docs) {
        if (err != null || docs == null) {
            callback(err, docs);
            return;
        }
        
        if (docs.author.toString() == uid) {
            postmodel.update({_id: id}, {$set: {text: ntext}}, callback);
        }
    });
};
/*
var post = new Post({author: "4f5c8ee3dd76edc40c000a01", text: "@nex puzza"});
post.write(function(err, docs) {
    
    
});
*/
exports.Post = Post;
