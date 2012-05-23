var User = require('../src/class.user.js').User,
    Recaptcha = require('recaptcha').Recaptcha,
    nodemailer = require('nodemailer'),
    util = require('../util.js'),
    events = require('events').EventEmitter,
    config = require('../config.js'),
    Validate = require("../src/class.validate.js").Validate,
    Session = require("../src/class.session.js").Session,
    check = require('validator').check;


exports.userlogin = function(req, res, next) {
	var username = req.params.username,
        password = req.params.password,
        user;
	
	if (username == undefined || password == undefined) {
		res.send({
			code: 200,
			body: {error: 6}
		});
		console.log("asd");
		return next();
	}
	console.log(User);
	
	user = new User({username: username, password: password});
	console.log(user);
	user.login(function(err, session) {
        var curr = new Date(),
            expire = new Date(curr.getTime()+1000000000000);
            
		if (err) {
			res.send({
				code: 200,
				body: {error: session}
			});
			return next();
		}
        
		res.send({
			code: 200,
			body: {error: 0, uid: session[1]},
			headers: {
				"Set-Cookie": 'session='+session[0]+'; Path=/; Expires='+expire.toUTCString()+";"
			}
		});
		return next();
	});
}


exports.userlogout = function(req, res, next) {
	var session, valid = new Validate({req: req, token: true}),
        sender = function(err, docs) {
            if (err) {
                res.send({code: 200, body: err});
                return;
            }
            
            console.log("lasdfkoaddis");
            var current = new Date(),
                expire = new Date(current.getTime()-1000000000000);

            res.send({
                code: 200,
                body: {error: 0},
                headers: {
                    "Set-Cookie": 'session=nexgay; Path=/; Expires='+expire.toUTCString()+";"
                }
            });
		};
	console.log("asdasd");
	valid.on("validate", function(sess, errcode) {
        
		if (!sess) {
            console.log("usfdghudfg");
			sender({error: errcode});
			return;
		}
		
		session = new Session({sessname: sess});
		session.del(sender);
	});
    
    valid.validate();
}


// 4f5cb0a9bf44a6b00f000001

exports.getinfo = function(req, res, next) {
	var id = req.uriParams.uid, 
	invalid = false,
	//event = new events,
	cookie, user, valid,
	sender = function(err, val) {
		if (err != null && !err.name) err = {error: 2};
		if (val && val[0]) {
			val[0].bday = val[0].bday.getDate()+"/"+(val[0].bday.getMonth()+1)+"/"+val[0].bday.getFullYear();
			ts = (err) ? err : {stats: val[0]};
		} else {
			ts = err;
		}
		res.send({
			code: 200,
			body: ts
		});
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
	
	return next();
}

exports.getinfoByUsername = function(req, res, next) {
	var username = req.uriParams.username, 
	invalid = false,
	//event = new events,
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
		res.send({
			code: 200,
			body: ts
		});
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
	
	return next();
}

exports.setinfo = function(req, res, next) {
	var session, valid,
	key = req.params.key,
	value = req.params.value,
	sender = function(err, val) {
		console.log("LOLSAOGKOSGKOK ");
		console.dir(val);
		err = (err != null && err.error) ? err : {error: 2};
		res.send({
			code: 200,
			body: (val || err)
		});
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

exports.addBookmark = function(req, res, next) {
	var pid = req.uriParams.id,
	user,
	valid = new Validate({req: req, token: true}),
	sender = function(err, val) {
		console.log(val);
		err = (err != null && err.error) ? err : {error: 2};
		res.send({
			code: 200,
			body: (val || err)
		});
	};
	console.log("inwrite");

	
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

exports.delBookmark = function(req, res, next) {
	var index = req.uriParams.index,
	user,
	valid = new Validate({req: req, token: true}),
	sender = function(err, val) {
		console.log(val);
		err = (err != null && err.error) ? err : {error: 2};
		res.send({
			code: 200,
			body: (val || err)
		});
	};
	console.log("inwrite");

	
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

exports.addFollower = function(req, res, next) {
	var uid = req.uriParams.uid,
	user,
	valid = new Validate({req: req, token: true}),
	sender = function(err, val) {
		console.log(val);
		err = (err != null && err.error) ? err : {error: 2};
		res.send({
			code: 200,
			body: (val || err)
		});
	};
	console.log("inwrite");

	
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
exports.userReg = function(req, res, next) {
	var username = req["params"]["username"],
		email = req["params"]["mail"],
		rname = req["params"]["rname"],
		rsurname = req["params"]["rsurname"],
		bday = req["params"]["bday"],
		language = req["params"]["language"],
		password = req["params"]["password"],
		sex = req.params.sex,
		challenge = req["params"]["recaptcha_challenge_field"],
		response = req["params"]["recaptcha_response_field"],
		ipAddr = req.headers['x-real-ip'],
		//ipAddr = "188.217.123.9",
		sender = function(body) {
			res.send(body);
		};
		
		req.params.ipAddr = ipAddr;

	if (username == undefined || password == undefined || email == undefined || rsurname == undefined || bday == undefined || sex == undefined || language == undefined || challenge == undefined || response == undefined) {
		res.send({
			code: 200, 
			body: {error: 3}
		});
		return;
	}


	data = {
		remoteip: ipAddr,
		challenge: challenge,
		response: response
	}
	
	if (!util.checkParams(req)) {
		sender({
			code: 200,
			body: {error: 6}
		});
		return;
	}
	
	recaptcha = new Recaptcha("6Lde380SAAAAAA2mQLO4FHuL8K-6dK-aazoRBJjh", "6Lde380SAAAAAC4-wi-T8fVER4-TEBRWUn2USI6s", data);
	recaptcha.verify(function(res, error_code) {
		if (!res) {
			sender({
				code: 200,
				body: {error: 8}
			});
			return next();
		}
		user = new User(req.params);
		user.register(function(err, docs) { // Done for schema-side regexp
			if (err) {
				console.log(err);
				sender({
					code: 200,
					body: {error: 2}
				});
				return next();
			}
			sender({
				code: 200,
				body: {error: 0}
			});
		});
	});
}


