var User = require('../src/class.user.js').User,
    Recaptcha = require('recaptcha').Recaptcha,
    nodemailer = require('nodemailer'),
    util = require('../util.js'),
    events = require('events').EventEmitter,
    config = require('../config.js'),
    Validate = require("../src/class.validate.js").Validate,
    Session = require("../src/class.session.js").Session,
    check = require('validator').check;


// Sistemare login
exports.userlogin = function() {
    var username = this.req.body.username,
        password = this.req.body.password,
        user;
    
    if (username == undefined || password == undefined) {
        this.res.json({error: 6});
    }
    
    user = new User({username: username, password: password});
    console.log(user);
    user.login(function(err, session) {
        var curr = new Date(),
            expire = new Date(curr.getTime()+1000000000000);
            
        if (err) {
            this.res.json({error: session});
            
        }
        
        this.res.writeHead(200, {
            "Set-Cookie": 'session='+session[0]+'; Path=/; Expires='+expire.toUTCString()+";",
            "Content-Type": 'application/json'
        });
        
        this.res.end(JSON.stringify({error: 0, uid: session[1]}));
    });
}


exports.userlogout = function() {
    var session, valid = new Validate({req: req, token: true}),
        sender = function(err, docs) {
            var current = new Date(),
                expire = new Date(current.getTime()-1000000000000);
            
            if (err) {
                this.res.json(err);
                return;
            }

            this.res.writeHead(200, {
                "Set-Cookie": 'session='+session[0]+'; Path=/; Expires='+expire.toUTCString()+";",
                "Content-Type": 'application/json'
            });

            this.res.end(JSON.stringify({error: 0, uid: session[1]}));
        };
    
    valid.on("validate", function(sess, errcode) {
        
        if (!sess) {
            sender({error: errcode});
            return;
        }
        
        session = new Session({sessname: sess});
        session.del(sender);
    });
    
    valid.validate();
}


// 4f5cb0a9bf44a6b00f000001

exports.getinfo = function(id) {
    var invalid = false,
        cookie, user, valid,
        sender = function(err, val) {
            if (err != null && !err.name) err = {error: 2};
            if (val && val[0]) {
                val[0].bday = val[0].bday.getDate()+"/"+(val[0].bday.getMonth()+1)+"/"+val[0].bday.getFullYear();
                ts = (err) ? err : {stats: val[0]};
            } else {
                ts = err;
            }
            this.res.json(ts);
        };

    valid = new Validate({req: req});
    
    valid.on("validate", function(sess, errcode) {
        console.log("asd");
        console.log(sess);
        
        if (!sess) {
            sender({error: errcode});
            return;
        }
        
        user = new User({id: id});
        user.getinfo(sender);
    });
    
    valid.validate();
    
    
}

exports.getinfoByUsername = function(username) {
    var invalid = false,
        cookie, user, valid,
        sender = function(err, val) {
            if (err != null && !err.name) err = {error: 2};
            console.dir(val);
            if (val && val[0]) {
                val[0].bday = val[0].bday.getDate()+"/"+(val[0].bday.getMonth()+1)+"/"+val[0].bday.getFullYear();
                ts = {stats: val[0]};
            } else {
                ts = err;
            }
            this.res.json(ts);
        };

    valid = new Validate({req: req});
    
    valid.on("validate", function(sess, errcode) {
        console.log("asd");
        console.log(sess);
        
        if (!sess) {
            sender({error: errcode});
            return;
        }
        
        user = new User({username: username});
        user.getinfo(sender);
    });
    
    valid.validate();
    
    
}

exports.setinfo = function() {
    var session, valid,
    key = this.req.body.key,
    value = this.req.body.value,
    sender = function(err, val) {
        console.log("LOLSAOGKOSGKOK ");
        console.dir(val);
        err = (err != null && err.error) ? err : {error: 2};
        this.res.json((val || err));
    };
    
    if (key == undefined || value == undefined) {
        sender({error: 6});
        return;
    }
    
    valid = new Validate({req: req, token: true});
    
    valid.on("validate", function(sessname, errcode) {
        if (!sessname) {
            sender({error: errcode});
            return;
        }
        
        sess = new Session({sessname: sessname});
        sess.get(function(err, docs) {
            if (!docs) {
                sender({error: 4});
                return;
            }
            
            user = new User({id: docs[0].vars[0].uid, key: key, value: value});
            user.setinfo(sender);
        });
    });
    
    valid.validate();
}

exports.addBookmark = function(pid) {
    var user,
        valid = new Validate({req: req, token: true}),
        sender = function(err, val) {
            console.log(val);
            err = (err != null && err.error) ? err : {error: 2};
            this.res.json(val || err);
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
                sender({error: 4});
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
        valid = new Validate({req: req, token: true}),
        sender = function(err, val) {
            console.log(val);
            err = (err != null && err.error) ? err : {error: 2};
            this.res.json(val || err);
        };

    
    valid.on("validate", function(sessname, m) {
        if (!sessname) {
            console.log("m "+m);
            sender({error: m});
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
            user = new User({id: uid, index: index});
            user.delBookmark(sender);
        });
    });
    
    valid.validate();
}

exports.addFollower = function(uid) {
    var uid = uid,
        user,
        valid = new Validate({req: req, token: true}),
        sender = function(err, val) {
            console.log(val);
            err = (err != null && err.error) ? err : {error: 2};
            this.res.json(val || err);
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
                sender({error: 4});
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
    var username = this.body.params.username,
        email = this.body.params.mail,
        rname = this.body.params.rname,
        rsurname = this.body.params.rsurname,
        bday = this.body.params.bday,
        language = this.body.params.language,
        password = this.body.params.password,
        sex = this.req.body.sex,
        challenge = this.body.params.recaptcha_challenge_field,
        response = this.body.params.recaptcha_response_field,
        ipAddr = req.headers['x-real-ip'],
        sender = function(body) {
            this.res.json(body);
        };
        
    this.req.body.ipAddr = ipAddr;

    if (username == undefined || password == undefined || email == undefined || rsurname == undefined || bday == undefined || sex == undefined || language == undefined || challenge == undefined || response == undefined) {
        sender({error: 3});
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
            sender({error: 8}); 
        }
        
        user = new User(this.req.body);
        user.register(function(err, docs) { // Done for schema-side regexp
            if (err) {
                console.log(err);
                sender({error: 2});
            }
            
            sender({error: 0});
        });
    });
}


