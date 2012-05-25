var postcontroller = require('./routes/controller-post.js');
var usercontroller = require('./routes/controller-user.js');
var commentcontroller = require('./routes/controller-comment.js');
var tokencontroller = require('./routes/controller-token.js');
var notcontroller = require('./routes/controller-notification.js');
var flatiron = require('flatiron');
var app = flatiron.app;

app.use(flatiron.plugins.http);

app.router.post('/api/login', usercontroller.userlogin);
app.router.get('/api/logout', usercontroller.userlogout);
app.router.get('/api/users/:username', usercontroller.getinfoByUsername);
app.router.put('/api/users/:username', usercontroller.setinfo);
app.router.get('/api/token', tokencontroller.getToken);
app.router.get('/api/posts', postcontroller.getPosts);
app.router.get('/api/users/:uid/posts', postcontroller.getPosts);
app.router.post('/api/posts', postcontroller.writePost);
app.router.delete('/api/posts/:id', postcontroller.deletePost);
app.router.get('/api/posts/:id', postcontroller.getPostById);
app.router.put('/api/posts/:id', postcontroller.updatePost);
app.router.post('/api/posts/:id/comments', commentcontroller.writeComment);
app.router.get('/api/posts/:id/comments', commentcontroller.readComment);
app.router.delete('/api/posts/:pid/comments/:id', commentcontroller.deleteComment);
app.router.get('/api/notifications/:type', notcontroller.read);
app.router.delete('/api/notifications/:index', notcontroller.delete);
app.router.delete('/api/notifications/seen/:index', notcontroller.seen);
app.router.post('/api/follow/:uid', usercontroller.addFollower);
app.router.post('/api/register', usercontroller.userReg);
app.start(8080);

