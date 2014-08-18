var wp_auth = require('wordpress-auth').create('http://enter/url/here',
  'LOGGED_IN_KEY',
  'LOGGED_IN_SALT',
  'enter host here',
  'enter username here',
  'enter password here',
  'enter database here',
  'enter table prefix here'
);


var io = require('socket.io'),
  connect = require('connect'),
  chatter = require('chatter');

var app = connect().use(connect.static('public')).listen(3000);
var chat_room = io.listen(app);

chatter.set_sockets(chat_room.sockets);

chat_room.sockets.on('connection', function (socket) {

  wp_auth.checkAuth(socket.handshake).on( 'auth', function  (auth_is_valid, user_id) {
    if (!auth_is_valid) {
      chatter.failure(socket);
    } else {
      wp_auth.db.query("select meta_value from wp_usermeta where meta_key = 'nickname' and user_id = '" + user_id + "'").on('row', function  (row) {
        chatter.connect_chatter({
          socket: socket,
          all_sockets: chat_room.sockets,
          username: row.meta_value
        });
      });
    }
  });  
});