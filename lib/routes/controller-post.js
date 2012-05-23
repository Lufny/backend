var Post = require("../src/class.post.js").Post,
  MongooseError = require("mongoose").Error,
  Validate = require("../src/class.validate.js").Validate,
  httputil = require("../httputil.js"),
  Session = require("../src/class.session.js").Session;

exports.getPosts = function (uid) {
  var req = this.req,
    res = this.res,
    body = req.body || {},
    limit = body.limit,
    id = body.id, 
    skip = body.skip,
    invalid = false,
    valid = new Validate({req: req}),
    post,
    cookie,
    sender = function(err, val) {
      var ts;
      console.log(err);
      console.log(val);
      ts = err || {posts: val};
      
      if (err instanceof MongooseError || err instanceof Error)
        ts = {error: 2};
        
      httputil.send(ts, req, res);
    };
    
  if (typeof uid !== "string") {
    uid = null;
  }
    
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

exports.getPostById = function(id) {
  var req = this.req,
    res = this.res,
    body = req.body || {},
    valid = new Validate({req: req}),
    post,
    cookie,
    sender = function(err, val) {
      var ts;
      
      ts = err || {posts: val};
      
      if (err instanceof MongooseError || err instanceof Error)
         ts = {error: 2};
      
      httputil.send(err || val, req, res);
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
  var req = this.req,
    res = this.res,
    body = req.body || {},
    text = body.text,
    valid = new Validate({req: req, token: true}),
    sender = function(err, val) {
      var ts;
      
      ts = err || val;
      
      if (err instanceof MongooseError || err instanceof Error)
         ts = {error: 2};
      
      httputil.send(err || val, req, res);
    };

  if (text == undefined) {
    sender({error: 1});
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
  var req = this.req,
    res = this.res,
    body = req.body || {},
    valid = new Validate({req: req, token: true}),
    sender = function(err, val) {
      var ts;
      
      ts = err || val;
      
      if (err instanceof MongooseError || err instanceof Error)
         ts = {error: 2};
      
      httputil.send(err || val, req, res);
    };
  
  if (!id) {
    sender({error: 1});  
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
  var req = this.req,
    res = this.res,
    body = req.body || {},
    text = body.text,
    valid = new Validate({req: req, token: true}),
    sender = function(err, val) {
      var ts;
      
      ts = err || val;
      
      if (err instanceof MongooseError || err instanceof Error)
         ts = {error: 2};
      
      httputil.send(err || val, req, res);
    };
  
  if (text == undefined) {
    sender({error: 1});
    
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
