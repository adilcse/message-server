const login = (req, res) => {
    console.log(req.session);
    const username = process.env.USER_NAME;
    const password = process.env.PASSWORD;
    const s = req.session;
    if (s.userid === username) {
      res.send({ status: true, message: 'already logged in' });
    } else if (req.body.username == username && req.body.password == password) {
      s.userid = req.body.username;
      res.send({
        status: true,
        message: 'login success'
      });
    } else {
      res.status(401).send({ status: false, message: 'invalid id or password' });
    }
  }

 module.exports = { login}