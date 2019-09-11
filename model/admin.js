const db = require('../db/conn');
const Schema = db.Schema;
const Admin = new Schema({
    username: String,
    password: String,
    classGrade: String,
    status: {
        type: Number,
        default: 0
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})
// db.getCollection("admins").insert([{
//     username: "2018140547",
//     password: "b6059d59b074c7e6f8c0228d6d4d2141",// 123loveyou,
//     classGrade: 'Z软件161',
//     status:0
// }]);
// db.getCollection("admins").insert([{
//     username: "2018140576",
//     password: "63b4869f6a825046b8052b687fe1f980",// 2018140576
//     classGrade: 'Z软件162',
//     status:0
// }]);
module.exports = db.model('Admin', Admin);