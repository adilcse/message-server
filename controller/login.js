const bcrypt = require('bcrypt');
const constants = require("../constants");
const { db } = require("../my-firebase");
const saltRounds = 10;
const login = async(req, res) => {
  console.log(req.body)
    const s = req.session;
    try{
      const admin = await db.collection(constants.USER).doc(constants.ADMIN).get();
      if (!admin.exists) {
        res.status(401).send({ status: false, message: 'Admin not found.' });
      } else {
        const adminUser = admin.data();

        if (s.userid === adminUser.username) {
          res.send({ status: true, message: 'already logged in' });
          return;
        } else if (req.body.username == adminUser.username) {
          bcrypt.compare(req.body.password, adminUser.password, function(err, result) {
            if(err){
              console.log(err);
              res.status(403).send({ status: false, message: 'Something went wrong with password verification.' });
              return;
            }
            if(result){
              s.userid = req.body.username;
              res.send({
                status: true,
                message: 'login success'
              });
              return;
            }
          res.status(401).send({ status: false, message: 'invalid password' });
        });
        } else {
          res.status(401).send({ status: false, message: 'invalid id or password' });
        }
      }
    } catch (err) {
      console.log(err)
      res.status(403).send({ status: false, message: 'Something went wrong!' ,err: JSON.stringify(err.message) });
    }
    
  }

  const changePassword = async(req, res) => {
    const s = req.session;
    try{
      const admin = await db.collection(constants.USER).doc(constants.ADMIN).get();
      if (!admin.exists) {
        res.status(401).send({ status: false, message: 'Admin not found.' });
      } else {
        const adminUser = admin.data();
        if (s.userid === adminUser.username) {
          bcrypt.hash(req.body.password, saltRounds, async(err, hash) => {
            if(err){
              console.log(err);
              res.status(403).send({ status: false, message: 'Something went wrong with password creation.' });
              return;
            }
            if(hash){
              await db.collection(constants.USER).doc(constants.ADMIN).update({ password: hash});
              res.send({
                status: true,
                message: 'password changed!'
              });
              return;
            }
            res.send({
              status: false,
              message: 'Something went wrong'
            });
        });
        } else {
          res.status(401).send({ status: false, message: 'User not logged in' });
        }
      }
    } catch (err) {
      console.log(err)
      res.status(403).send({ status: false, message: 'Something went wrong!' ,err: JSON.stringify(err.message) });
    }
    
  }
 module.exports = { login, changePassword }