var session = require("../src/class.session.js"),
  MongooseError = require("mongoose").Error,
  Validate = require("../src/class.validate.js").Validate,
  Session = require("../src/class.session.js").Session,
  httputil = require("../httputil.js"),
  util = require("../util.js");

exports.getToken = function() {
  var req = this.req,
    res = this.res,
    body = req.body || {},
    valid = new Validate({req: req}),
    sender = function(err, val) {
      var ts;
      
      ts = err || {token: val};
      
      if (err instanceof MongooseError || err instanceof Error)
         ts = {error: 2};
      
      httputil.send(ts, req, res);
    };
  
  
  valid.on("validate", function(sessname, m) {
    if (!sessname) {
      sender({error: m});
      return;
    }
    
    sess = new Session({sessname: sessname});
    sess.tokenget(sender);
  });
  
  valid.validate();
}
