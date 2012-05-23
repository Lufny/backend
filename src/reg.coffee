User = require('./class.user.js').User
Post = require('./class.post.js').Post

register = ->
	user = new User
		mail: process.argv[3]
		username: process.argv[4]
		password: process.argv[5]
		rname: process.argv[6]
		rsurname: process.argv[7]
		bday: process.argv[8]
		language: process.argv[9]
		validated: true
	
	user.register (err, docs) ->
		if err?
			console.log err
			process.exit 1
		
		console.log docs
		process.exit 0

post = ->
	user = new User
		username: process.argv[3]
	
	user.getinfo (err, docs) ->
		if err?
			console.log err
			process.exit 1
		
		post = new Post
			author: docs[0]._id.toString()
			text: process.argv[4]
		post.write ->
			if err?
				console.log err
				process.exit 1
			
			console.log docs
			process.exit 1
			
help = (act) ->
	switch act
		when "register"
			console.log 'coffee reg.coffee register "mail", "username", "password", "rname", "rsurname", "bday", "language"'
			process.exit 1
		when "post"
			console.log 'coffee reg.coffee post "username", "text"'
			process.exit 1

control = (x, act) -> help act unless x?
process.exit 1 if not process.argv[2]?

switch process.argv[2]
	when "register"
		control process.argv[x], "register" for x in [3..8]
		register()
	when "post"
		control process.argv[x], "post" for x in [3..4]
		post()