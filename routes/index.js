var express = require('express');
var fs = require('fs');
var archiver = require('archiver');
var zipper = require("zip-local");
var router = express.Router();
const JobSchema = require('./../model/job');
const CourseSchema = require('./../model/course');
const StuSchema = require('./../model/stu');


router.get('/download', function (req, res, next) {
  console.log(req.query);
  let { testName, courseId } = req.query;
  let path = '';
  let course = '';
  if (courseId === '1') {
    course = 'linux';
    path = 'c://file//job//linux';
    // path = '/Users/georgeleeo/Documents/file/大四上/linux/' + testName;
  }
  if (courseId === '2') {
    course = 'net';
    path = 'c://file//job//net';
    // path = '/Users/georgeleeo/Documents/file/大四上/net/' + testName;
  }
  console.log(path, course);

  zipper.sync.zip(path + '//' + course).compress().save(path + "//" + testName + ".zip");
  res.send({ code: 0, data: { url: "http://139.159.201.22:5000/" + course + '/' + testName + ".zip", name: course + '_' + testName + '.zip' } });

});
router.get('/stus', function (req, res, next) {
  StuSchema.find({ status: 0 }, function (err, doc) {
    if (err) {
      res.send({ code: 1, msg: err });
    } else {
      res.send({ code: 0, data: doc });
    }
  });
});

router.get('/jobs', function (req, res, next) {
  let options = req.query;

  JobSchema.find(options, function (err, doc) {
    if (err) {
      res.send({ code: 1, msg: err });
    } else {
      res.send({ code: 0, data: doc });
    }
  });
});
router.get('/courses', function (req, res, next) {
  CourseSchema.find({}, function (err, doc) {
    if (err) {
      res.send({ code: 1, msg: err });
    } else {
      res.send({ code: 0, data: doc });
    }
  });
});
router.post('/save', function (req, res, next) {
  // console.log(req.files.files);
  let files = req.files.files;
  let { number, name, courseId, testName } = req.body;
  console.log(number, name, courseId, testName);
  // notes: {$regex: options.notes}}
  // db.getCollection('stus').find({number:'2018140547'})
  StuSchema.find({ number, name }, function (err, doc) {
    if (err) {
      res.send({ code: 1, msg: err });
    } else {
      console.log(doc);

      if (doc === null) {
        res.send({ code: 2, msg: '查无此人' });
      } else {
        JobSchema.findOne({ number, name, courseId }, function (err, doc) {
          if (err) {
            res.send({ code: 1, msg: err });
          } else {
            let path = '';
            let prefix = '';
            if (courseId === '1') {
              path = 'c://file//linux//' + testName + '//';
              // path = '/Users/georgeleeo/Documents/file/大四上/linux/' + testName + '/';
              prefix = 'linux_';
            }
            if (courseId === '2') {
              path = 'c://file//net//' + testName + '//';
              // path = '/Users/georgeleeo/Documents/file/大四上/net/' + testName + '/';
              prefix = '网络管理_';
            }
            let fis = files.name.split('.');
            let suffix = fis[fis.length - 1];
            let fileName = prefix + number + '_' + name + '.' + suffix;
            console.log(fileName);

            if (doc === null) {
              JobSchema.insertMany({ number, name, courseId, testName }, function (err, doc) {
                if (err) {
                  res.send({ code: 1, msg: err });
                } else {
                  files.mv(path + fileName, function (e) {
                    if (e) {
                      res.send({ code: 1, msg: e });
                    } else {
                      JobSchema.updateOne({ number }, { $set: { files: files.name, modifyAt: new Date() } }, (err, doc) => {
                        if (err) {
                          res.send({ code: 1, msg: e });
                        } else {
                          console.log('1: ', doc);

                          if (doc.nModified === 1) {
                            res.send({ code: 0, data: 'success' });
                          } else {
                            res.send({ code: 1, msg: e });
                          }
                        }
                      })
                    }
                  });
                }
              })
            } else {
              files.mv(path + fileName, function (e) {
                if (e) {
                  res.send({ code: 1, msg: e });
                } else {
                  JobSchema.updateOne({ number }, { $set: { files: files.name, modifyAt: new Date() } }, (err, doc) => {
                    if (err) {
                      res.send({ code: 1, msg: e });
                    } else {
                      console.log('2: ', doc);

                      if (doc.nModified === 1) {
                        res.send({ code: 0, data: 'success' });
                      } else {
                        res.send({ code: 1, msg: e });
                      }
                    }
                  })
                }
              });
            }
          }
        });
      }

    }
  })



});

module.exports = router;
