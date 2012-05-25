var md5 = require('jshashes').MD5(),
  md = require('node-markdown').Markdown,
  config = require("../config.js"),
  User = require("./class.user.js").User,
  Session = require("./class.session.js").Session,
  util = require("../util.js"),
  events = require('events'),
  user;

function Validate(valid) {
  this.valid = valid;
  events.EventEmitter.call(this);
}

Validate.super_ = events.EventEmitter;
Validate.prototype = Object.create(events.EventEmitter.prototype, {
  constructor: {
    value: Validate,
    enumerable: false
  }
});

Validate.prototype.validate = function() {
  var sessname, session, vars = [], owner = {},
    req = this.valid.req, 
    cookie = req.headers.cookie, 
    self = this,
    body = req.body || {},
    token = body.token,
    senderr = function(m) {
      self.emit("validate", false, m);
    },
    send_valid = function() {
      self.emit("validate", sessname, vars, owner);
    };
  
  
  console.dir(cookie);
  
  if (!util.checkParams(req)) {
    senderr(6);
    return;
  }
  
  if (typeof cookie === "undefined") {
    return senderr(1);
  }
  
  if (this.valid.token && typeof token === "undefined") {
    return senderr(4);
  }
  
  sessname = new RegExp(/session=(.+?)($|;)/i).exec(cookie);

  if (sessname === null) {
    senderr(1);
    return;
  }
  
  sessname = sessname[1];
  session = new Session({sessname: sessname});
  session.get(function(err, docs) {
    var id;
    
    console.log("gay");
    
    if (err || !docs || docs.length == 0) {
      senderr(3);
      return;
    }
    
    vars = docs.vars[0];
    owner = docs.owner;
    id = owner._id.toString().toString();
    docs = (docs.length >= 1) ? docs[0] : null;
    
    if (!self.valid.token) {
      send_valid();
      return;
    }
    
    if (err || vars.token !== token) {
      senderr(4);
      return;
    }
    
    if (self.valid.antiflood === false) {
      send_valid();
      return;
    }
    
    user = new User({id: id, ip: req.headers['x-real-ip']});
    user.canPost(function(can) {
      if (can) { // OH GOSH, IS ENGLISH
        user.updateProfile(function(err, docs) {
          if (err) {
            return senderr(2);
          }
          
          send_valid();
        });
      } else {
        senderr(5);
      }
    });    
  });
};

exports.Validate = Validate;