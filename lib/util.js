var md5 = require('jshashes').MD5(),
	md = require('node-markdown').Markdown,
	events = require('events').EventEmitter;

exports.postFilter = function(text) {
		text = text.replace(/\n/g, "<br />\n");
		text = md({
			text: text,
			strip: true,
			escapeTags: true,
			allowedAttributes: {
				'img': 'src|alt',
				'a':   'href'
			}
		});
		return text;
}


function toObj(r) {
	for (var i = 0, x = {}; i<r.length; x[r[i]] = '', i++); // I had fun writing this
	return x;
}

exports.inArray = function(needle, haystack) {
	return needle in toObj(haystack);
}

exports.checkParams = function(req) {
	for (var i in req.params) {
		if (typeof req.params[i] == "object") {
			return false;
		}
	}
	return true;
}

exports.getTags = function(text) {
	var matching = true,
        reg = /([^@]|^)@([^@][A-Za-z0-9_!\^\-\$\.]*?( |$|,|\n))/,
        users = [];
	matching = reg.exec(text);
    
	while (matching !== null) {
        matching = matching[2].replace(" ", "");
		users.push(matching);
		matching = reg.exec(text);
	}
	
	return users;
}

exports.checkValues = function(object, keys) { // TODO: Move this into class.validate.js
	var keys = Object.keys(object), i;
	
	for (i=0; i<keys.length; i++) {
		if (object[keys[i]] == undefined) {
			return false;
		}
	}
	return true;
}

exports.toDate = function(v) {
    v = v.split('/');
	v = v.map(function(n) { return parseInt(n); });
	return new Date(v[2], v[1]-1, v[0]+1);
}

exports.random_string = function(len) { // do not use len for secured functions (like email validation token)
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz", rands = "", n, randn, ms = new Date().getTime();
	len = (len == undefined) ? 32 : len;

	for (n=0; n<len; n++) {
		randn = Math.abs(Math.floor(Math.random() * chars.length-1)); 		
		rands += chars[randn];
	}
	
	rands = md5.hex(ms+rands).substr(0, len);
	return rands;
}
