const db = require('../db/conn');
const Schema = db.Schema;
const Course = new Schema({
  name: String,
  courseId: String,
  tests: Array,
  createAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = db.model('Course', Course);