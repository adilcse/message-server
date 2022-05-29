const {db, FieldValue} = require('../firebase');
const forwardMessage = require('./forwardMessage');
const BATCH_SIZE = 100;
const MESSAGE_COLLECTION = "messages";
const MASTER_DOC = "master";
const ACTION_COLLECTION = "action";
const defaultReciver = process.env.DEFAULT_RECEIVER;

const bootstrap = async (req,res,next) => {
    try {
        const doc = await db.collection(ACTION_COLLECTION).doc(MASTER_DOC).get();
        if (!doc.exists) {
        throw Error("no receiver");
        } else {
        const data = doc.data();
        if (data) {
        res.send({status: true, data: {
            to:data.to || defaultReciver,
            items: data.action || [],
        }});
        } else {
            throw Error("no number found");
        }
        }
    } catch (e) {
        console.error(e);
        if(defaultReciver) {
        res.send({status: true, data: {
            to:defaultReciver,
            items: []
        }});
        } else {
        res.status(404).send({status: false, message: "no receiver found"});
        }
    }
};

const updateMaterAction = async (req,res) => {
    const body = req.body;
    try{
        const update = {};
        if (body.to){
            update.to = body.to;
        }
        if(body.selected) {
            update.selected = body.selected;
        }
        await db.collection(ACTION_COLLECTION).doc(MASTER_DOC).set({...update, updatedAt: FieldValue.serverTimestamp()}, { merge: true });
        res.status(201).send({status: true, message: 'saved'})
    } catch (e) {
        console.error(e);
        res.status(402).send({status: false, message: 'not able to update'})
    }
  
}

module.exports = {bootstrap, updateMaterAction}