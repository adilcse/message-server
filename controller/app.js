const {db, FieldValue} = require('../firebase');
const forwardMessage = require('./forwardMessage');
const BATCH_SIZE = 100;
const MESSAGE_COLLECTION = "messages";
const MASTER_DOC = "master";
const ACTION_COLLECTION = "action";
const defaultReciver = process.env.DEFAULT_RECEIVER;
const saveList=async(req,res) => {
    const messages = req.body;
    const id=req.query.id;
    if(Array.isArray(messages)) {
        const data = messages.map(message => ({
            ...message,
            id:id,
            status:'',
            createdAt: FieldValue.serverTimestamp()
        }));
       for (let i = 0; i < data.length; i+=BATCH_SIZE) {
            const batch = db.batch();
            data.slice(i, i+BATCH_SIZE).forEach(row=>{
                var docRef = db.collection(MESSAGE_COLLECTION).doc();
                batch.set(docRef, row);
            }); 
            await batch.commit();
       }
       res.send({status: true, message: "messages saved"})
    } else {
        res.status(400).send({status: false, message: "body must be an array"})
    }
}

const saveMessage = async(req,res) => {
    const message = req.body || {};
    const id=req.query.id;
    const data ={
        ...message,
        id:id,
        status:'',
        createdAt: FieldValue.serverTimestamp()
    }
    await db.collection(MESSAGE_COLLECTION).add(data);
    const messageString = `from: ${message.address} body:${message.body}`;
    forwardMessage(messageString);
    res.send({status: true, message: "messages saved"})
}

const getReceiver = async(req,res) => {
    try {
        const doc = await db.collection(ACTION_COLLECTION).doc(MASTER_DOC).get();
        if (!doc.exists) {
        throw Error("no receiver");
        } else {
        const data = doc.data();
        if (data && data.to) {
        res.send({status: true, data: data.to});
        } else {
            throw Error("no number found");
        }
        }
    } catch (e) {
        console.error(e);
        if(defaultReciver) {
        res.send({status: true, data: defaultReciver});
        } else {
        res.status(404).send({status: false, message: "no receiver found"});
        }
    }
}

module.exports = {saveList, saveMessage, getReceiver};