var Comment = require("../src/class.comment.js").Comment,
    Session = require("../src/class.session.js").Session,
    fs = require("fs"),
    Validate = require("../src/class.validate.js").Validate;


exports.readComment = function(pid) {    
    var limit = this.req.body.limit,
        skip = this.req.body.skip,
        valid = new Validate({req: req}),
        comment,
        sender = function(err, val) {
            var tsend = (err ? (err.error || {error :2}) : {comments: val});
            this.res.json(tsend);
        };
    
    
    if (!pid) {
        sender({error: 6});
        
    }
    
    if (limit == undefined) {
        (skip == null) ? limit = 10 : limit = [10, parseInt(skip)];
    } else if (skip != undefined) {
        limit = [parseInt(limit), parseInt(skip)];
    }

    if (typeof(limit) == "string") {
        limit = parseInt(limit);
    }
    
    valid.on("validate", function(sessname) {
        if (!sessname) {
            sender({error: 3});
            return;
        }
        
        comment = new Comment({pid: pid, limit: limit});
        comment.read(sender);
    });
    
    valid.validate();


    
}


exports.writeComment = function(pid) {
    var text = this.req.body.text,
        valid = new Validate({req: req, token: true}),
        sender = function(err, val) {
            //
            err = (err != null && err.error) ? err : {error: 2};
            this.res.json(val || err);
        };
    

    if (!text || !pid) {
        sender({error: 6});
        return;
    }
    
    valid.on("validate", function(sessname, m) {
        if (!sessname) {
            sender({error: m});
            return;
        }
        
        sess = new Session({sessname: sessname});
        sess.get(function(err, docs) {
            var uid, comment;
            if (!docs) {
                sender({error: 4});
                return;
            }
            uid = docs[0].vars[0].uid;
            comment = new Comment({uid: uid, text: text, pid: pid});
            comment.create(sender);
        });
    });
    
    valid.validate();

}


exports.deleteComment = function(cid) {
    var comment,
        valid = new Validate({req: req, token: true}),
        sender = function(err, val) {
            t_s = (!err || err instanceof Error) ? val : err;
            this.res.json(t_s);
        };
    
    valid.on("validate", function(sessname) {
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
            comment = new Comment({id: cid, uid: uid});
            comment.del(sender);
        });
    });
    
    valid.validate();
}
