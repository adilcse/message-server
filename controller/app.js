const {db, FieldValue} = require('../my-firebase');
const forwardMessage = require('./forwardMessage');
const constants = require('../constants')

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
       for (let i = 0; i < data.length; i+=constants.BATCH_SIZE) {
            const batch = db.batch();
            const batchedData = data.slice(i, i+constants.BATCH_SIZE);
            batchedData.forEach(row=>{
                var docRef = db.collection(constants.MESSAGE_COLLECTION).doc();
                batch.set(docRef, row);
            }); 
            db.collection(constants.MESSAGE_COUNTER_COLLECTION).doc(constants.MESSAGE_COUNTER_DOC).update({ messagesCount: FieldValue.increment(batchedData.length) })
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
    await db.collection(constants.MESSAGE_COLLECTION).add(data);
    await db.collection(constants.MESSAGE_COUNTER_COLLECTION).doc(constants.MESSAGE_COUNTER_DOC).update({ messagesCount: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() })
    const messageString = `from: ${message.address} body:${message.body}`;
    // forwardMessage(messageString);
    res.send({status: true, message: "messages saved"})
}

const getReceiver = async(req,res) => {
    try {
        const doc = await db.collection(constants.ACTION_COLLECTION).doc(constants.MASTER_DOC).get();
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