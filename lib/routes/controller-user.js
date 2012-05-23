var User = require('../src/class.user.js').User,
  MongooseError = require("mongoose").Error,
  Recaptcha = require('recaptcha').Recaptcha,
  nodemailer = require('nodemailer'),
  util = require('../util.js'),
  events = require('events').EventEmitter,
  config = require('../config.js'),
  Validate = require("../src/class.validate.js").Validate,
  Session = require("../src/class.session.js").Session,
  httputil = require("../httputil.js"),
  check = require('validator').check;


exports.userlogin = function() {
  var req = this.req,
    res = this.res,
    body = req.body || {},
    username = body.username,
    password = body.password,
    user;
  
  if (username == undefined || password == undefined) {
    httputil.send({error: 1}, req, res);
  }
  
  user = new User({username: username, password: password});

  user.login(function(err, session) {
    var curr = new Date(),
      expire = new Date(curr.getTime()+1000000000000);
    console.log("inlogin");  
    if (err) {
      httputil.send({error: session}, req, res);
    }
    
    res.writeHead(200, {
      "Set-Cookie": 'session='+session[0]+'; Path=/; Expires='+expire.toUTCString()+";",
      "Content-Type": 'application/json'
    });
    
    res.end(JSON.stringify({error: 0, uid: session[1]}));
  });
}


exports.userlogout = function() {
  var req = this.req,
    res = this.res,
    body = req.body || {},
    session, valid = new Validate({req: req, token: true}),
    sender = function(err, docs) {
      var current = new Date(),
        expire = new Date(current.getTime()-1000000000000);
      
      if (err) {
        httputil.send(err, req, res);
        return;
      }

      res.writeHead(200, {
        "Set-Cookie": 'session='+session[0]+'; Path=/; Expires='+expire.toUTCString()+";",
        "Content-Type": 'application/json'
      });

      res.end(JSON.stringify({uid: session[1]}));
    };
  
  valid.on("validate", function(sess, m) {
    if (!sess) {
      sender({error: m});
      return;
    }
    
    session = new Session({sessname: sess});
    session.del(sender);
  });
  
  valid.validate();
}


// 4f5cb0a9bf44a6b00f000001

/*
exports.getinfo = function(id) {
  var req = this.req,
    res = this.res,
    body = req.body || {},
    invalid = false,
    cookie, user, valid,
    sender = function(err, val) {
      if (val && val[0]) {
        val[0].bday = val[0].bday.getDate()+"/"+(val[0].bday.getMonth()+1)+"/"+val[0].bday.getFullYear();
        ts = err || {stats: val[0]};
      } else {
        ts = err;
      }
      
      if (err instanceof MongooseError || err instanceof Error)
         ts = {error: 2};
      
      httputil.send(ts, req, res);
    };

  valid = new Validate({req: req});
  
  valid.on("validate", function(sess, m) {
    console.log("asd");
    console.log(sess);
    
    if (!sess) {
      sender({error: m});
      return;
    }
    
    user = new User({id: id});
    user.getinfo(sender);
  });
  
  valid.validate();
}*/

exports.getinfoByUsername = function(username) {
  var req = this.req,
    res = this.res,
    body = req.body || {},
    invalid = false,
    cookie, user, valid,
    sender = function(err, val) {
      if (val && val[0]) {
        val[0].bday = val[0].bday.getDate()+"/"+(val[0].bday.getMonth()+1)+"/"+val[0].bday.getFullYear();
        ts = err || {stats: val[0]};
      } else {
        ts = err;
      }
      
      if (err instanceof MongooseError || err instanceof Error)
         ts = {error: 2};
      
      httputil.send(ts, req, res);
    };

  valid = new Validate({req: req});
  
  valid.on("validate", function(sess, m) {
    console.log("asd");
    console.log(sess);
    
    if (!sess) {
      sender({error: m});
      return;
    }
    
    user = new User({username: username});
    user.getinfo(sender);
  });
  
  valid.validate();
  
  
}

exports.setinfo = function() {
  var req = this.req,
    res = this.res,
    body = req.body || {},
    session, valid,
    key = body.key,
    value = body.value,
    sender = function(err, val) {
      var ts;
      
      ts = err || val;
      
      if (err instanceof MongooseError || err instanceof Error)
         ts = {error: 2};
      
      httputil.send(err || val, req, res);
    };
  
  if (key == undefined || value == undefined) {
    sender({error: 1});
    return;
  }
  
  valid = new Validate({req: req, token: true});
  
  valid.on("validate", function(sessname, m, owner) {
    if (!sessname) {
      sender({error: m});
      return;
    }
    
    if (!docs) {
      sender({error: 1});
      return;
    }
    
    user = new User({id: owner._id, key: key, value: value});
    user.setinfo(sender);
  });
  
  valid.validate();
}

exports.addBookmark = function(pid) {
  var req = this.req,
    res = this.res,
    body = req.body || {},
    user,
    valid = new Validate({req: req, token: true}),
    sender = function(err, val) {
      var ts;
      
      ts = err || val;
      
      if (err instanceof MongooseError || err instanceof Error)
         ts = {error: 2};
      
      httputil.send(err || val, req, res);
    };

  
  valid.on("validate", function(sessname, m) {
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
      user = new User({id: uid, pid: pid});
      user.addBookmark(sender);
    });
  });
  
  valid.validate();
}

exports.delBookmark = function(index) {
  var user,
    req = this.req,
    body = req.body || {},
    res = this.res,
    valid = new Validate({req: req, token: true}),
    sender = function(err, val) {
      var ts;
      
      ts = err || val;
      
      if (err instanceof MongooseError || err instanceof Error)
         ts = {error: 2};
      
      httputil.send(err || val, req, res);
    };

  
  valid.on("validate", function(sessname, m) {
    if (!sessname) {
      sender({error: m});
      return;
    }
    
    sess = new Session({sessname: sessname});
    sess.get(function(err, docs) {
      var uid;
      
      if (!docs) {
        return sender({error: 1});
      }
      
      uid = docs[0].vars[0].uid;
      user = new User({id: uid, index: index});
      user.delBookmark(sender);
    });
  });
  
  valid.validate();
}

exports.addFollower = function(uid) {
  var req = this.req,
    res = this.res,
    body = req.body || {},
    d,
    user,
    valid = new Validate({req: req, token: true}),
    sender = function(err, val) {
      var ts;
      
      ts = err || val;
      
      if (err instanceof MongooseError || err instanceof Error)
         ts = {error: 2};
      
      httputil.send(err || val, req, res);
    };

  
  valid.on("validate", function(sessname, m) {
    if (!sessname) {
      console.log("m "+m);
      sender({error: m});
      return;
    }
    
    sess = new Session({sessname: sessname});
    sess.get(function(err, docs) {
      var id;
      
      if (!docs) {
        sender({error: 1});
        return;
      }
      
      id = docs[0].vars[0].uid;
      user = new User({uid: uid, id: id});
      user.addFollower(sender);
    });
  });
  
  valid.validate();
}

// TO REWRITE
exports.userReg = function() {
  var req = this.req,
    res = this.res,
    body = req.body || {},
    username = this.body.params.username,
    email = this.body.params.mail,
    rname = this.body.params.rname,
    rsurname = this.body.params.rsurname,
    bday = this.body.params.bday,
    language = this.body.params.language,
    password = this.body.params.password,
    sex = body.sex,
    challenge = this.body.params.recaptcha_challenge_field,
    response = this.body.params.recaptcha_response_field,
    ipAddr = req.headers['x-real-ip'],
    sender = function(body) {
      httputil.send(body, req, res);
    };
    
  body.ipAddr = ipAddr;

  if (username == undefined || password == undefined || email == undefined || rsurname == undefined || bday == undefined || sex == undefined || language == undefined || challenge == undefined || response == undefined) {
    sender({error: 1});
    return;
  }


  data = {
    remoteip: ipAddr,
    challenge: challenge,
    response: response
  }
  
  if (!util.checkParams(req)) {
    sender({error: 6});
    return;
  }
  
  recaptcha = new Recaptcha("6Lde380SAAAAAA2mQLO4FHuL8K-6dK-aazoRBJjh", "6Lde380SAAAAAC4-wi-T8fVER4-TEBRWUn2USI6s", data);
  recaptcha.verify(function(res, error_code) {
    if (!res) {
      sender({err: "Bad captcha"}); 
    }
    
    user = new User(req.body);
    user.register(function(err, docs) { // Done for schema-side regexp
      if (err) {
        console.log(err);
        sender({error: 2});
      }
      
      sender({error: 0});
    });
  });
}


