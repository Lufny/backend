var PM = require("../src/class.pm.js").PM,
Validate = require("../src/class.validate.js").Validate,
Session = require("../src/class.session.js").Session;

exports.readPM = function(req, res, next) {
	var pm, valid = new Validate({req: req}),
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
		
		sess = new Session({sessname: sessname});
		sess.get(function(err, docs) {
			var uid;
			if (!docs) {
				sender({error: 4});
				return;
			}
			uid = docs[0].vars[0].uid;
			pm = new PM({uid: uid});
			pm.read(sender);
		});
	});
	
	valid.validate();
	
	return next();
}

exports.writePM = function(req, res, next) {
	var pm,
	text = req.params.text,
	to = req.uriParams.to,
	valid = new Validate({req: req, token: true}),
	sender = function(err, val) {
		
		err = (err != null && err.error) ? err : {error: 2};
		res.send({
			code: 200,
			body: (val || err)
		});
	};
	
	if (text == undefined) {
		sender({error: 6});
		return next();
	}
	
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
			pm = new PM({from: uid, text: text, to: to});
			pm.write(sender);
		});
	});
	
	valid.validate();
}
