const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const urlConnect = 'mongodb://admin:VuOd3VKlZCpBVLYQ@meu-dinheiro-shard-00-00-qcut3.mongodb.net:27017,meu-dinheiro-shard-00-01-qcut3.mongodb.net:27017,meu-dinheiro-shard-00-02-qcut3.mongodb.net:27017/chat?ssl=true&replicaSet=meu-dinheiro-shard-0&authSource=admin';

mongoose.Promise = global.Promise;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded())

app.get('/', (req, res) => res.render('home'));

mongoose
  .connect(urlConnect)
  .then(() => {
    app.listen(3000, () => console.log('running...'));
  });
