var session = require("../src/class.session.js"),
Validate = require("../src/class.validate.js").Validate,
Session = require("../src/class.session.js").Session,
util = require("../util.js");

exports.getToken = function(req, res, next) {
	var valid = new Validate({req: req}),
		sender = function(err, val) {
			err = (err && {error: 2});
			res.send({
				code: 200,
				body: (val) ? {token: val} : err
			});
		};
	
	
	valid.on("validate", function(sessname) {
		
		if (!sessname) {
			sender({error: 2});
			return;
		}
		sess = new Session({sessname: sessname});
		sess.tokenget(sender);
	});
	
	valid.validate();
}
