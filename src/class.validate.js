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
    var req = this.valid.req, 
        cookie = req.headers.cookie, 
        self = this,
        token = req.params.token,
        senderr = function(m) {
            
            self.emit("validate", false, m);
        },
        sessname, session;
    
    
    
    if (!util.checkParams(req)) {
        senderr(6);
        return;
    }
    //console.log("----> "+token);
    if (cookie == undefined || (this.valid.token && typeof token == "undefined")) {
        senderr(7);
        return;
    }
    
    sessname = new RegExp(/session=(.+?)($|;)/i).exec(cookie);
    if (sessname == null) {
        senderr(1);
        return;
    }
    
    sessname = sessname[1];
    session = new Session({sessname: sessname});
    
    session.get(function(err, docs) {
        var id, vars;
        
        if (err || !docs || docs.length == 0) {
            senderr(2);
            return;
        }
        
        
        vars = docs[0].vars[0];
        
        id = vars.uid;
        
        docs = (docs.length >= 1) ? docs[0] : null;
        
        
        
        if (self.valid.token == undefined) {
            self.emit("validate", sessname);
            
            return;
        }
        
        if (err || vars.token !== token) {
            senderr(3);
            return;
        }
        
        if (self.valid.antiflood === false) {
            self.emit("validate", sessname);
            return;
        }
        
        user = new User({id: id, ip: req.headers['x-real-ip']});
        user.canPost(function(can) {
            if (can) { // OH GOSH, IS ENGLISH
                user.updateProfile(function(err, docs) {
                    if (err) {
                        senderr(4);
                        return;
                    }
                    
                    self.emit("validate", sessname);
                    
                });
            } else {
                senderr(5);
            }
        });        
    });
};

exports.Validate = Validate;