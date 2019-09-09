const db = require('../db/conn');
const Schema = db.Schema;
const Job = new Schema({
  number: String,
  name: String,
  courseId: String,
  files: String,
  testName: String,
  createAt: {
    type: Date,
    default: Date.now
  },
  modifyAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = db.model('Job', Job);