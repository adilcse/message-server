const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const chechAuth = require('./middleware/auth');
const isMyApp = require('./middleware/auth');
const {saveList, saveMessage} = require('./controller/app');
require('./firebase');
require("dotenv").config();
const oneMonth = 1000 * 60 * 60 * 24 * 30;

const app = express();
app.use(bodyParser.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: oneMonth },
}));

const port = process.env.PORT || "8000";

app.post('/login', (req, res) => {
  console.log(req.body);
  const username = process.env.USER_NAME;
  const password = process.env.PASSWORD;
  const s = req.session;
  if (s.userid) {
    res.send({ status: true, message: 'already logged in' });
  } else if (req.body.username == username && req.body.password == password) {
    s.userid = req.body.username;
    console.log(req.session)
    res.send({
      status: true,
      message: 'login success'
    });
  } else {
    res.status(401).send({ status: false, message: 'invalid id or password' });
  }
});

app.get('/logout', chechAuth,(req,res) => {
  req.session.destroy();
  res.send({status: true, message: 'successfully logged out'});
});

app.post('/list', isMyApp,saveList);
app.post('/message', isMyApp,saveMessage);

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

process.on('uncaughtException', (error, origin) => {
  console.error('uncaughtException');
  console.error(error.message);
  console.error(error.stack);
  console.error(origin.toString());

})