const db = require('../db/conn');
const Schema = db.Schema;
const Stu = new Schema({
    name: String,
    number: String,
    createAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = db.model('Stu', Stu);