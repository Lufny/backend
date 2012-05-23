var session = require("../src/class.session.js"),
  MongooseError = require("mongoose").Error,
  Validate = require("../src/class.validate.js").Validate,
  Session = require("../src/class.session.js").Session,
  Notification = require("../src/class.notification.js").Notification,
  httputil = require("../httputil.js"),
  util = require("../util.js");

exports.read = function(type) {
  var req = this.req,
    res = this.res,
    body = req.body || {},
    valid = new Validate({req: req}),
    q,
    not,
    cookie,
    sender = function(err, val) {
      var ts;
      
      if (val) 
        val = val.splice(-10, 10);
      
      ts = err || {notifications: val};
      
      if (err instanceof MongooseError || err instanceof Error)
        ts = {error: 2};
      
      httputil.send(ts, req, res);
    };
  
  switch (type) {
    case 'global':
      q = {query: "global"};
      break;
    case 'seen':
      q = {query: "seen"};
      break;
    case 'unseen':
      q = {query: "unseen"};
      break;
  }
  
  valid.on("validate", function(sessname, m) {
    var sess;
    
    if (!sessname) {
      sender({error: m});
      return;
    }
    
    sess = new Session({sessname: sessname});
    sess.get(function(err, docs) {
      var uid;
      
      if (!docs) {
        sender({error: 1});
        return;
      }
      
      uid = docs[0].vars[0].uid;
      q.uid = uid;
      not = new Notification(q);
      not.read(sender);
    });
  });
  
  valid.validate();  
}

exports.del = function(index) {
  var req = this.req,
    res = this.res,
    body = req.body || {},
    valid = new Validate({req: req, token: true}),
    not,
    cookie,
    sender = function(err, val) {
      var ts;
      
      ts = err || val;
      
      if (err instanceof MongooseError || err instanceof Error)
         ts = {error: 2};
      
      httputil.send(err || val, req, res);
    };
  
  
  valid.on("validate", function(sessname, m) {
    var sess;
    
    if (!sessname) {
      sender({error: m});
      return;
    }
    
    sess = new Session({sessname: sessname});
    sess.get(function(err, docs) {
      var uid;
      
      if (!docs) {
        sender({error: 1});
        return;
      }
      
      uid = docs[0].vars[0].uid;
      not = new Notification({uid: uid, index: index});
      not.del(sender);
    });
  });
  
  valid.validate();
}

exports.seen = function(index) {
  var req = this.req,
    res = this.res,
    body = req.body || {},
    valid = new Validate({req: req, token: true, antiflood: false}),
    not,
    cookie,
    sender = function(err, val) {
      var ts;
      
      ts = err || val;
      
      if (err instanceof MongooseError || err instanceof Error)
         ts = {error: 2};
      
      httputil.send(err || val, req, res);
    };
  
  
  valid.on("validate", function(sessname, m) {
    var sess;
    
    if (!sessname) {
      sender({error: m});
      return;
    }
    
    sess = new Session({sessname: sessname});
    sess.get(function(err, docs) {
      var uid;
      
      if (!docs) {
        sender({error: 1});
        return;
      }
      
      uid = docs[0].vars[0].uid;
      not = new Notification({uid: uid, index: index, see: true});
      not.del(sender);
    });
  });
  
  valid.validate();
}
