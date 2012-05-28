// Generated by CoffeeScript 1.3.1
(function() {
  var User, control, help, register, x, _i;

  User = require('./class.user.js').User;

  register = function() {
    var user;
    user = new User({
      mail: process.argv[2],
      username: process.argv[3],
      password: process.argv[4],
      rname: process.argv[5],
      rsurname: process.argv[6],
      bday: process.argv[7],
      language: process.argv[8]
    });
    return user.register(function(err, docs) {
      if (err != null) {
        
        return process.exit(1);
      } else {
        
        return process.exit(0);
      }
    });
  };

  help = function(act) {
    switch (act) {
      case "register":
        
        return process.exit(1);
    }
  };

  control = function(x, act) {
    if (x == null) {
      return help(act);
    }
  };

  if (!(process.argv[2] != null)) {
    process.exit(1);
  }

  switch (process.argv[2]) {
    case "register":
      for (x = _i = 2; _i <= 8; x = ++_i) {
        control(process.argv[x], "register");
      }
  }

  /*
  user = new User
  	mail: 'prova@prova.lol'
  	username: 'kolla'
  	password: 'nexgay'
  	rname: 'lol'
  	rsurname: 'lal'
  	bday: '11/11/11'
  	language: 'it'
  
  user.register (err, docs) ->
  	if err? then console.log err else console.log docs
  */


}).call(this);