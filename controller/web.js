const {db, FieldValue} = require('../my-firebase');
const forwardMessage = require('./forwardMessage');
const constants = require('../constants')
const defaultReciver = process.env.DEFAULT_RECEIVER;

const bootstrap = async (req,res,next) => {
    const query = req.query;
    try {
        const sendData = {
            status: true,
            data: {
            to:defaultReciver,
            items: [],
            count: 0
            }
        }
        const doc = await db.collection(constants.ACTION_COLLECTION).doc(constants.MASTER_DOC).get();
        if (process.env.SHOW_TABLE == 'true' || (query && query.showTable == 'true')) {
        const messageCount = await db.collection(constants.MESSAGE_COUNTER_COLLECTION).doc(constants.MESSAGE_COUNTER_DOC).get();
            if (messageCount.exists) {
                const count = messageCount.data();
                if (count && count.messagesCount) {
                    sendData.data.count = count.messagesCount;
                }
            }
            const messages = await db.collection(constants.MESSAGE_COLLECTION).orderBy('date', 'desc').limit(10).get();
            if (!messages.empty) {
                messages.forEach(message => {
                    if (sendData.data.messages) {
                        sendData.data.messages.push(message.data())
                    } else {
                        sendData.data.messages = [message.data()]
                    }
                });
            }
        }
        if (doc.exists) {
        const data = doc.data();
        if (data) {
            sendData.data.to=data.to;
            sendData.data.items=data.action;
            }
        }
        res.send(sendData);
    } catch (e) {
        console.error(e);
        if(defaultReciver) {
        res.send({
            status: true,
            data: {
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
        await db.collection(constants.ACTION_COLLECTION).doc(constants.MASTER_DOC).set({...update, updatedAt: FieldValue.serverTimestamp()}, { merge: true });
        res.status(201).send({status: true, message: 'saved'})
    } catch (e) {
        console.error(e);
        res.status(402).send({status: false, message: 'not able to update'})
    }
  
}

module.exports = {bootstrap, updateMaterAction}