var Post = require("../src/class.post.js").Post,
    Validate = require("../src/class.validate.js").Validate,
    Session = require("../src/class.session.js").Session;

exports.getPosts = function (uid){
    var limit = this.req.body.limit,
    id = this.req.body.id, 
    skip = this.req.body.skip,
    invalid = false,
    valid = new Validate({req: req}),
    post,
    cookie,
    sender = function(err, val) {
        var ts;
        if (err != null && !err.name) err = {error: 2};
        ts = (err) ? err : {posts: val};
        this.res.json(ts);
    };
    
    

    if (limit == undefined) {
        (skip == null) ? limit = 10 : limit = [10, parseInt(skip)];
    } else if (skip != undefined) {
        limit = [parseInt(limit), parseInt(skip)];
    }

    if (typeof(limit) == "string") {
        limit = parseInt(limit);
    }
    
    valid.on("validate", function(sessname, errcode) {
        if (!sessname) {
            sender({error: errcode});
            return;
        }
        
        if (uid) {
            post = new Post({limit: limit, author: uid});
            post.read(sender);
            return;
        }
        post = new Post({limit: limit});
        post.readMain(sender);
    });
    
    valid.validate();


    
}

exports.getPostById = function (id){
    var valid = new Validate({req: req}),
    post,
    cookie,
    sender = function(err, val) {
        var ts;
        if (err != null && !err.name) err = {error: 2};
        ts = (err) ? err : {posts: val};
        this.res.json(ts);
    };
    
    
    valid.on("validate", function(sessname, errcode) {
        if (!sessname) {
            sender({error: errcode});
            return;
        }
        
        post = new Post({pid: id});
        post.readOne(sender);
    });
    
    valid.validate();


    
}

exports.writePost = function() {
    var text = this.req.body.text,
        valid = new Validate({req: req, token: true}),
        sender = function(err, val) {
            t_s = (!err || err instanceof Error) ? val : err;
            this.res.json(t_s);
        };

    if (text == undefined) {
        sender({error: 6});
        
    }
    
    valid.on("validate", function(sessname, errcode) {
        if (!sessname) {
            
            sender({error: errcode});
            return;
        }
        
        sess = new Session({sessname: sessname});
        sess.get(function(err, docs) {
            var uid;
            if (!docs) {
                sender({error: 4});
                return;
            }
            uid = docs[0].vars[0].uid;
            post = new Post({author: uid, text: text});
            post.write(sender);
        });
    });
    
    valid.validate();

}

exports.deletePost = function(id) {
    var valid = new Validate({req: req, token: true}),
        sender = function(err, val) {
            this.res.json((val || err));
        };
    
    if (!id) {
        sender({error: 6});    
    }
    
    valid.on("validate", function(sessname, errcode) {
        if (!sessname) {
            sender({error: errcode});
            return;
        }
        
        sess = new Session({sessname: sessname});
        sess.get(function(err, docs) {
            var uid;
            if (!docs) {
                sender({error: 4});
                return;
            }
            uid = docs[0].vars[0].uid;
            post = new Post({uid: uid, id: id});
            post.del(sender);
        });
    });
    
    valid.validate();
}


exports.updatePost = function(id) {
    var text = this.req.body.text,
        valid = new Validate({req: req, token: true}),
        sender = function(err, val) {
            err = (err != null && err.error) ? err : {error: 2};
            this.res.json((val || err));
        };
    
    if (text == undefined) {
        sender({error: 6});
        
    }
    
    valid.on("validate", function(sessname, errcode) {
        if (!sessname) {
            sender({error: errcode});
            return;
        }
        
        sess = new Session({sessname: sessname});
        sess.get(function(err, docs) {
            var uid;
            if (!docs) {
                sender({error: 4});
                return;
            }
            uid = docs[0].vars[0].uid;
            post = new Post({id: id, uid: uid, text: text});
            post.update(sender);
        });
    });
    
    valid.validate();

}
