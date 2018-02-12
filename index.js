const express = require('express');
const app = express();
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const urlConnect = 'mongodb://admin:VuOd3VKlZCpBVLYQ@meu-dinheiro-shard-00-00-qcut3.mongodb.net:27017,meu-dinheiro-shard-00-01-qcut3.mongodb.net:27017,meu-dinheiro-shard-00-02-qcut3.mongodb.net:27017/chat?ssl=true&replicaSet=meu-dinheiro-shard-0&authSource=admin';

mongoose.Promise = global.Promise;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: 'socketio',
  cookie: {
    maxAge: 10*60*1000
  },
  resave: true,
  saveUninitialized: true
}));

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

mongoose
  .connect(urlConnect)
  .then(() => {
    app.listen(3000, () => console.log('running...'));
  });
