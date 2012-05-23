var Post = require("../src/class.post.js").Post,
Validate = require("../src/class.validate.js").Validate,
Session = require("../src/class.session.js").Session;
/*var user = require("./social-funcs-user.js");
var util = require("./util.js");
var token = require("./controller-token.js");
var session = require("./social-funcs-session");
var events = require('events');
*/

exports.getPosts = function (req, res, next){
	var limit = req.params.limit,
	uid = req.uriParams.uid, 
	id = req.params.id, 
	skip = req.params.skip,
	invalid = false,
	valid = new Validate({req: req}),
	post,
	cookie,
	sender = function(err, val) {
		var ts;
		if (err != null && !err.name) err = {error: 2};
		ts = (err) ? err : {posts: val};
		res.send({
			code: 200,
			body: ts
		});
	};
	
	

	if (limit == undefined) {
		(skip == null) ? limit = 10 : limit = [10, parseInt(skip)];
	} else if (skip != undefined) {
		limit = [parseInt(limit), parseInt(skip)];
	}

	if (typeof(limit) == "string") {
		limit = parseInt(limit);
	}
	
	valid.on("validate", function(sessname, errcode) {
		if (!sessname) {
			sender({error: errcode});
			return;
		}
		
		if (uid) {
			post = new Post({limit: limit, author: uid});
			post.read(sender);
			return;
		}
		post = new Post({limit: limit});
		post.readMain(sender);
	});
	
	valid.validate();


	return next();
}

exports.getPostById = function (req, res, next){
	var id = req.uriParams.id,
	valid = new Validate({req: req}),
	post,
	cookie,
	sender = function(err, val) {
		var ts;
		if (err != null && !err.name) err = {error: 2};
		ts = (err) ? err : {posts: val};
		res.send({
			code: 200,
			body: ts
		});
	};
	
	
	valid.on("validate", function(sessname, errcode) {
		if (!sessname) {
			sender({error: errcode});
			return;
		}
		
		post = new Post({pid: id});
		post.readOne(sender);
	});
	
	valid.validate();


	return next();
}

exports.writePost = function(req, res, next) {
	var text = req.params.text,
		valid = new Validate({req: req, token: true}),
		sender = function(err, val) {
			t_s = (!err || err instanceof Error) ? val : err;
			res.send({
				code: 200,
				body: t_s
			});
		};

	if (text == undefined) {
		sender({error: 6});
		return next();
	}
	
	valid.on("validate", function(sessname, errcode) {
		if (!sessname) {
			
			sender({error: errcode});
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
			post = new Post({author: uid, text: text});
			post.write(sender);
		});
	});
	
	valid.validate();

}

exports.deletePost = function(req, res, next) {
	var id = req.uriParams.id,
	valid = new Validate({req: req, token: true}),
	sender = function(err, val) {
		res.send({
			code: 200,
			body: (val || err)
		});
	};
	
	if (!id) {
		sender({error: 6});
		return next();
	}
	
	valid.on("validate", function(sessname, errcode) {
		if (!sessname) {
			sender({error: errcode});
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
			post = new Post({uid: uid, id: id});
			post.del(sender);
		});
	});
	
	valid.validate();
}


exports.updatePost = function(req, res, next) {
	var text = req.params.text,
	valid = new Validate({req: req, token: true}),
	id = req.uriParams.id,
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
	
	valid.on("validate", function(sessname, errcode) {
		if (!sessname) {
			sender({error: errcode});
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
			post = new Post({id: id, uid: uid, text: text});
			post.update(sender);
		});
	});
	
	valid.validate();

}
