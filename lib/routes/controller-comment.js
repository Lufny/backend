var Comment = require("../src/class.comment.js").Comment,
  MongooseError = require("mongoose").Error,
  Session = require("../src/class.session.js").Session,
  fs = require("fs"),
  httputil = require("../httputil.js"),
  Validate = require("../src/class.validate.js").Validate;


exports.readComment = function(pid) {  
  var req = this.req,
    res = this.res,
    body = req.body || {},
    limit = body.limit,
    skip = body.skip,
    valid = new Validate({req: req}),
    comment,
    sender = function(err, val) {
      var ts;
      
      ts = err || val;
      
      if (err instanceof MongooseError || err instanceof Error)
         ts = {error: 2};
      
      httputil.send(err || val, req, res);
    };
  
  
  if (!pid) {
    sender({error: 1});  
  }
  
  if (limit == undefined) {
    (skip == null) ? limit = 10 : limit = [10, parseInt(skip)];
  } else if (skip != undefined) {
    limit = [parseInt(limit), parseInt(skip)];
  }

  if (typeof(limit) == "string") {
    limit = parseInt(limit);
  }
  
  valid.on("validate", function(sessname, m) {
    if (!sessname) {
      sender({error: m});
      return;
    }
    
    comment = new Comment({pid: pid, limit: limit});
    comment.read(sender);
  });
  
  valid.validate();


  
}


exports.writeComment = function(pid) {
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
  

  if (!text || !pid) {
    sender({error: 1});
    return;
  }
  
  valid.on("validate", function(sessname, m, owner) {
    var comment;
    
    if (!sessname) {
      sender({error: m});
      return;
    }
    
    if (!docs) {
      sender({error: 1});
      return;
    }
    
    comment = new Comment({uid: owner._id, text: text, pid: pid});
    comment.create(sender);
  });
  
  valid.validate();
}


exports.deleteComment = function(cid) {
  var req = this.req,
    res = this.res,
    body = req.body || {},
    comment,
    valid = new Validate({req: req, token: true}),
    sender = function(err, val) {
      var ts;
      
      ts = err || val;
      
      if (err instanceof MongooseError || err instanceof Error)
         ts = {error: 2};
      
      httputil.send(err || val, req, res);
    };
  
  valid.on("validate", function(sessname, m, owner) {
    if (!sessname) {
      sender({error: m});
      return;
    }
      
    if (!docs) {
      sender({error: 1});
      return;
    }
    
    comment = new Comment({id: cid, uid: owner._id});
    comment.del(sender);
  });
  
  valid.validate();
}
