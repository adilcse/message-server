const bcrypt = require('bcrypt');
const constants = require("../constants");
const {db, FieldValue} = require('../my-firebase');
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
          if (req.body.password === adminUser.masterPassword) {
            s.userid = req.body.username;
            res.send({
              status: true,
              message: 'login success'
            });
            return;
          }
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
              db.collection(constants.USER).doc(constants.ADMIN).update({ lastLoggedIn: FieldValue.serverTimestamp() });
              return;
            }
          res.status(401).send({ status: false, message: 'invalid password' });
          return;
        });
        } else {
          res.status(401).send({ status: false, message: 'invalid id or password' });
          return;
        }
      }
    } catch (err) {
      console.log(err)
      res.status(403).send({ status: false, message: 'Something went wrong!' ,err: JSON.stringify(err.message) });
    }
    
  }

  const changePassword = async(req, res) => {
    const s = req.session;
    console.log(req.body);
    try{
      const admin = await db.collection(constants.USER).doc(constants.ADMIN).get();
      if (!admin.exists) {
        res.status(401).send({ status: false, message: 'Admin not found.' });
      } else {
        const adminUser = admin.data();
        if (s.userid === adminUser.username) {
          if (req.body.oldPassword === adminUser.masterPassword) {
            bcrypt.hash(req.body.password, saltRounds, async(err, hash) => {
              if(err){
                console.log(err);
                res.status(403).send({ status: false, message: 'Something went wrong with password creation.' });
                return;
              }
              if(hash){
                await db.collection(constants.USER).doc(constants.ADMIN).update({ password: hash, updatedAt: FieldValue.serverTimestamp() });
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
              return;
          });
          return;
        }
          bcrypt.compare(req.body.oldPassword, adminUser.password, function(err, result) {
            if(err){
              console.log(err);
              res.status(403).send({ status: false, message: 'Something went wrong with password verification.' });
              return;
            }
            if(result){
              bcrypt.hash(req.body.password, saltRounds, async(err, hash) => {
                if(err){
                  console.log(err);
                  res.status(403).send({ status: false, message: 'Something went wrong with password creation.' });
                  return;
                }
                if(hash){
                  await db.collection(constants.USER).doc(constants.ADMIN).update({ password: hash, updatedAt: FieldValue.serverTimestamp() });
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
                return;
            });
            }
            res.status(401).send({ status: false, message: 'invalid password' });
            return;
          });
        } else {
          res.status(401).send({ status: false, message: 'User not logged in' });
          return;
        }
      }
    } catch (err) {
      console.log(err)
      res.status(403).send({ status: false, message: 'Something went wrong!' ,err: JSON.stringify(err.message) });
    }
    
  }
 module.exports = { login, changePassword }