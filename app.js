var flatiron = require('flatiron'),
    path = require('path'),
    app = flatiron.app;

//app.config.file({ file: path.join(__dirname, 'config', 'config.json') });

app.use(flatiron.plugins.http);

app.router.post('/', function () {
  console.dir(this.req.body);
  this.res.json({ 'hello': 'world' });
});

app.start(3000);
