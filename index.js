require('dotenv').config();

const express = require('express');
const app = express();
const session = require('express-session');
const sharedSession = require('express-socket.io-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const urlConnect = process.env.DB_URL;
const port = process.env.PORT || 3000;

const Room = require('./models/room');
const Message = require('./models/message');

mongoose.Promise = global.Promise;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const expressSession = session({
  secret: 'socketio',
  cookie: {
    maxAge: 10*60*1000
  },
  resave: true,
  saveUninitialized: true
});

app.use(expressSession);
io.use(sharedSession(expressSession, { autoSave: true }));

app.get('/', (req, res) => res.render('home'));
app.post('/', (req, res) => {
  req.session.user = {
    name: req.body.name
  };

  res.redirect('/room');
});

app.get('/room', (req, res) => {
  if (!req.session.user) {
    res.redirect('/');
    return;
  }

  res.render('room', { name: req.session.user.name });
});

io.on('connection', socket => {

  Room.find({}, (err, rooms) => {
    socket.emit('roomList', rooms);
  });

  socket.on('addRoom', roomName => {
    const room = new Room({ name: roomName });
    room
      .save()
      .then(() => {
        io.emit('newRoom', room);
      });
  });

  socket.on('join', roomId => {
    socket.join(roomId);

    Message
      .find({room: roomId})
      .then(msgs => socket.emit('msgList', msgs));
  });

  socket.on('sendMsg', msg => {
    const message = new Message({
      author: socket.handshake.session.user.name,
      when: new Date(),
      message: msg.text,
      msgType: 'text',
      room: msg.room
    });

    message
      .save()
      .then(() => {
        io.to(msg.room).emit('newMsg', message)
      });
  });

});

mongoose
  .connect(urlConnect)
  .then(() => {
    http.listen(port, () => console.log('running...'));
  });
