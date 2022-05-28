const {db, FieldValue} = require('../firebase')
const BATCH_SIZE = 100;
const MESSAGE_COLLECTION = "messages"
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
    res.send({status: true, message: "messages saved"})
}

module.exports = {saveList, saveMessage};