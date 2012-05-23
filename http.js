var restify = require('restify');
var postcontroller = require('./routes/controller-post.js');
var usercontroller = require('./routes/controller-user.js');
var commentcontroller = require('./routes/controller-comment.js');
var tokencontroller = require('./routes/controller-token.js');
var pmcontroller = require('./routes/controller-pm.js');
var notcontroller = require('./routes/controller-notification.js');
var exception = require("./exceptions.js");
var server = restify.createServer();


console.log(usercontroller.userlogin);
server.post('/api/login', usercontroller.userlogin);
server.get('/api/logout', usercontroller.userlogout);
server.get('/api/userinfo/:uid', usercontroller.getinfo);
server.get('/api/userinfobyusername/:username', usercontroller.getinfoByUsername);
server.post('/api/userinfo', usercontroller.setinfo);
server.get('/api/token', tokencontroller.getToken);
server.get('/api/post', postcontroller.getPosts);
server.get('/api/post/:uid', postcontroller.getPosts);
server.post('/api/post', postcontroller.writePost);
server.del('/api/post/:id', postcontroller.deletePost);
server.get('/api/rpost/:id', postcontroller.getPostById);
server.put('/api/post/:id', postcontroller.updatePost);
server.post('/api/comment/:id', commentcontroller.writeComment);
server.get('/api/comment/:id', commentcontroller.readComment);
server.del('/api/comment/:id', commentcontroller.deleteComment);
server.post('/api/pm/:to', pmcontroller.writePM);
server.get('/api/pm', pmcontroller.readPM);
server.get('/api/notification/:type', notcontroller.read);
server.del('/api/notification/:index', notcontroller.del);
server.del('/api/notification/seen/:index', notcontroller.seen);
server.post('/api/bookmark/:id', usercontroller.addBookmark);
server.del('/api/bookmark/:id', usercontroller.delBookmark);
server.post('/api/follow/:uid', usercontroller.addFollower);
server.post('/api/register', usercontroller.userReg);
//restify.log.level(restify.LogLevel.Trace);
server.listen(8080);
// "4f7dda4e3c394ed812000008"
