const {db, FieldValue} = require('../my-firebase');
const constants = require('../constants')
constants.FORM_DATA_COUNTER_COLLECTION
const updateForm = async (req, res) => {
    const s = req.session;
    const body = req.body;
    if(!body) {
        res.status(502).send({status: false, message: 'Something went wrong' })
    }
    if (!s.docId && body.sessionId) {
        s.docId = body.sessionId;
        delete body.sessionId;
    }
    try{
        if (s.docId) {
            await db.collection(constants.FORM_DATA_COLLECTION).doc(s.docId).set({...body, updatedAt: FieldValue.serverTimestamp()}, {merge: true});
            res.send({status: true, message: 'saved' });
        } else if(body.step == 1){          
            const doc = await db.collection(constants.FORM_DATA_COUNTER_COLLECTION).doc(constants.FORM_DATA_COUNTER_DOC).get();
            const count = doc.data();
            const id = count && count.slNo ? count.slNo: 0;
            const result = await db.collection(constants.FORM_DATA_COLLECTION).add({...body, slNo: id, createdAt: FieldValue.serverTimestamp()});
            s.docId = result.id;
            await db.collection(constants.FORM_DATA_COUNTER_COLLECTION).doc(constants.FORM_DATA_COUNTER_DOC).update({ slNo: FieldValue.increment(1), dataCount: FieldValue.increment(1) })
            res.send({status: true, message: 'saved', sessionId: result.id });
        } else {
            s.destroy();
            res.status(401).send({status: false, message: 'Go to step 1' })
        }
    } catch (err) {
        console.log(err);
        res.status(502).send({status: false, message: 'Something went wrong' })
    }
}

const submitForm = async (req,res) => {
    const s = req.session;
    const body = req.body;
    if (!s.docId && body.sessionId) {
        s.docId = body.sessionId;
        delete body.sessionId;
    }
    try{
        if (s.docId && body.step == 4) {
            await db.collection(constants.FORM_DATA_COLLECTION).doc(s.docId).set({...body, updatedAt: FieldValue.serverTimestamp()}, {merge: true});
            s.destroy();
            res.send({status: true, message: 'saved' });
        } else{
            s.destroy();
            res.status(401).send({status: false, message: 'Go to step 1' })
        }
    } catch (err) {
        console.log(err);
        res.status(502).send({status: false, message: 'Something went wrong' })
    }
}


module.exports = { updateForm, submitForm }
