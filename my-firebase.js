const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = require('./application.json');
console.log('initializeing firebase')
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
module.exports = {db, Timestamp, FieldValue};
