var joomla = require('joomla'), 
  connect = require('connect'),
  io = require('socket.io'),
  chatter = require('chatter'),
  cookie = require('cookie');

// If PHP CLI is not installed, use this and pass config
// instead of a string with the path to Joomla.
//
// var config = {
//   user: 'add user here',
//   password: 'add password here',
//   db: 'add db here',
//   dbprefix: 'add prefix here'
// };

joomla('/path/to/joomla/site', function  () {
  console.log('Joomla site ready');	
});

var app = connect().use(connect.static('public')).listen(3000);
var chat_room = io.listen(app);

chatter.set_sockets(chat_room.sockets);

chat_room.sockets.on('connection', function (socket) {

  var parsed = cookie.parse(socket.handshake.headers.cookie);

  joomla.auth_cookies(parsed, function  (j_user) {
    if (j_user.username === "") {
      chatter.failure(socket);
    } else {
      chatter.connect_chatter({
        socket: socket,
        all_sockets: chat_room.sockets,
        username: j_user.username
      });
    }
  });

});