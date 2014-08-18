var drupal = require('drupal'), 
  connect = require('connect'),
  io = require('socket.io'),
  chatter = require('chatter'),
  cookie = require('cookie');

var app = connect().use(connect.static('public')).listen(3000);
var chat_room = io.listen(app);

chatter.set_sockets(chat_room.sockets);

drupal.db.connect({
  host: 'add host here',
  user: 'add username here',
  password: 'add password here',
  database: 'add database here'
});

chat_room.sockets.on('connection', function (socket) {

  var cookies = cookie.parse(socket.handshake.headers.cookie);

  var found_session = false;

  Object.keys(cookies).forEach(function (key) {
    if (key.indexOf('SESS') === 0) {
      found_session = cookies[key];
    }    
  });
  
  if (found_session === false) {
    chatter.failure(socket);
  } else {
    drupal.user.session_load(found_session, function  (error, result) {
      if (result === null) {
        return false;
      }
      
      drupal.user.load(result.uid, function  (error, row) {
        if (row === null) {
          chatter.failure(socket);
        } else {
          chatter.connect_chatter({
            socket: socket,
            all_sockets: chat_room.sockets,
            username: row.name
          });
        }
      });

    });
  }

});