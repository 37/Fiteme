var express = require('express');
var stormpath = require('express-stormpath');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// game and room management
var gameCount = 0;
var balancer = true;
var roomhistory = [];
var gameClients = [];
var currentRoom;


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


app.set('port', (process.env.PORT || 8080));
server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function makeGameId(callback){
  currentRoom = '';
  var id = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i=0; i < 5; i++) {
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  if (id.length == 5) {
    return callback(id);
  }
}

function isRoom(room) {
  return true;
}

io.on('connection', function (socket) {

  if (balancer == true) {
    balancer = false;
    makeGameId(function(room){
      currentRoom = room;
      socket.join(room, function(err){
        if (!err){
          gameCount++;
          gameClients[socket.id] = room;
          console.log('room created: ' + room);
          io.to(room).emit('status', 'search', '1', 'Player 1 has entered the game.');
        } else {
          console.log(err, 'e');
          console.log('Cannot create new room, client:' + socket);
        }
      });
    });

  } else {
    balancer = true;

    if (isRoom(currentRoom)){
      socket.join(currentRoom, function(err){
        if (!err){
          gameCount++;
          gameClients[socket.id] = currentRoom;
          console.log('room joined: ' + currentRoom);
          io.to(currentRoom).emit('status', 'start', '2', 'Player 2 has entered the game.');
        } else {
          console.log(err, 'e');
          console.log('Cannot join room, client: ' +  socket);
        }
      });
    } else {
      console.log('Assigned room doesnt exist.');
    }

  }

  //listening for updates from chat rooms;
  socket.on('message', function(from, position, data) {
    var room = gameClients[socket.id];
    delete data.socketId;
    io.to(room).emit('message', from, position, data);
  })

  //default room settings
  socket.on('disconnect', function () {
    var room = gameClients[socket.id];
    io.to(room).emit('status', 'GG, player 1 bitched out & rage quit.');

    if (balancer == true) {
      balancer = false;
    } else {
      balancer = true;
    }
  });
});
