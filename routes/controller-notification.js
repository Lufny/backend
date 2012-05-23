var session = require("../src/class.session.js"),
    Validate = require("../src/class.validate.js").Validate,
    Session = require("../src/class.session.js").Session,
    Notification = require("../src/class.notification.js").Notification,
    util = require("../util.js");

exports.read = function(type) {
    var valid = new Validate({req: req}),
        q,
        not,
        cookie,
        sender = function(err, val) {
            var ts;
            if (err != null && !err.name) err = {error: 2};
            ts = (err) ? err : {notifications: val};
            //console.dir(ts);
            if (ts.notifications) {
                ts.notifications = ts.notifications.splice(-10, 10);
            }
            this.res.json(ts);
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
    
    valid.on("validate", function(sessname) {
        var sess;
        if (!sessname) {
            sender({error: 3});
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
            q.uid = uid;
            not = new Notification(q);
            not.read(sender);
        });
    });
    
    valid.validate();    
}

exports.del = function(index) {
    var valid = new Validate({req: req, token: true}),
        not,
        cookie,
        sender = function(err, val) {
            
            
            err = (err && {error: 2});
            this.res.json(val || err);
        };
    
    
    valid.on("validate", function(sessname) {
        var sess;
        if (!sessname) {
            sender({error: 3});
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
            not = new Notification({uid: uid, index: index});
            not.del(sender);
        });
    });
    
    valid.validate();
}

exports.seen = function(index) {
    var valid = new Validate({req: req, token: true, antiflood: false}),
        not,
        cookie,
        sender = function(err, val) {
            console.log("NOTY");
            console.log(err);
            err = (err && {error: 2});
            this.res.json((val || err));
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
                sender({error: 4});
                return;
            }
            uid = docs[0].vars[0].uid;
            not = new Notification({uid: uid, index: index, see: true});
            not.del(sender);
        });
    });
    
    valid.validate();
}
