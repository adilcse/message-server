const chechAuth = (req,res,next) => {
    const s = req.session;
  if (s.userid) {
    next();
  } else {
      res.status(401).send({status: false, message: 'not authorized'});
  }
}

const isMyApp = (req,res,next) => {
    const auth = req.header('Authorization');
    if (auth == process.env.APP_CLIENT_SECRET) {
        next();
    } else {
        res.status(401).send({status: false, message: 'app not authorized'});
    }
}
module.exports = {chechAuth, isMyApp};
