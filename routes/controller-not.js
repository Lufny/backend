var session = require("../src/class.session.js"),
Validate = require("../src/class.validate.js").Validate,
Session = require("../src/class.session.js").Session,
Notification = require("../src/class.notification.js").Notification,
util = require("../util.js");

exports.read = function(req, res, next) {
	var valid = new Validate({req: req}),
	not,
	cookie,
	sender = function(err, val) {
		err = (err && {error: 2});
		
		res.send({
			code: 200,
			body: (val || err)
		});
	};
	
	
	valid.on("validate", function(sessname) {
		if (!sessname) {
			sender({error: 3});
			return;
		}
		
		sess.get(function(err, docs) {
			var uid;
			if (!docs) {
				sender({error: 4});
				return;
			}
			uid = docs[0].vars[0].uid;
			not = new Notification({uid: uid});
			not.read(sender);
		}
	});
	
	valid.validate();	

}