var express = require('express');
var stormpath = require('express-stormpath');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var connectionCount;

var stormpathMiddleware = stormpath.init(app, {
  apiKeyFile: './storm/apiKey.properties',
  application: 'https://api.stormpath.com/v1/applications/7GhZzyjSP2k4YtPHPCYhVL',
  secretKey: 'keaton_candice_eliza_unihack',
	expandCustomData: true,
	enableForgotPassword: true
});

app.set('views', './views');
app.set('view engine', 'jade');

app.use(stormpathMiddleware);
app.use(express.static(__dirname + '/public'));

app.use('/', require('./routes/index')());
app.use('/profile', require('./routes/profile')());
app.use('/fight', require('./routes/fight')());
app.use('/battle', require('./routes/battle')());
app.use('/judge', require('./routes/judge')());

app.set('port', (process.env.PORT || 8080));
server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

io.on('connection', function (socket) {
  io.emit('status', 'Player has entered the game.');

  socket.on('message', function (from, msg) {
    io.emit('message', from, msg);
  });

  socket.on('disconnect', function () {
    io.emit('status', 'GG, player 1 bitched out & rage quit.');
  });
});
