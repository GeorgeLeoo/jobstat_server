var express = require('express');
var zipper = require("zip-local");
var router = express.Router();
const JobSchema = require('./../model/job');
const CourseSchema = require('./../model/course');
const StuSchema = require('./../model/stu');
const AdminSchema = require('./../model/admin');

const basePath = '/root/www/jobstat_upload/';
// const basePath = '/Users/georgeleeo/Documents/file/大四上/';
// const fileBaseUrl = "http://192.168.3.25:5000/";
const fileBaseUrl = "http://139.159.201.22:5000/jobstat_upload";

/**
 * 下载链接
 */
router.post('/download', function (req, res, next) {
  // console.log(req.body);

  let { testName, courseId, username, password } = req.body;

  AdminSchema.findOne({ username, password }, function (err, doc) {
    if (err) {
      res.send({ code: 1, msg: err });
    } else {
      if (doc === null) {
        res.send({ code: 1, msg: '请检查账号密码是否正确' });
      } else {
        // server
        let classGrade = doc.classGrade;
        let path = '';
        let course = '';
        if (courseId === '1') {
          course = 'linux';
          path = basePath + classGrade + '/linux/';
        }
        if (courseId === '2') {
          course = 'net';
          path = basePath + classGrade + '/net/';
        }
        // console.log(path, course);
        // console.log('zip url: ' + path + testName);
        zipper.sync.zip(path + testName).compress().save(path + "/" + classGrade + '_' + course + '_' + testName + ".zip");

        // console.log({ url: fileBaseUrl + classGrade + '/' + course + "/" + testName + ".zip", name: course + '_' + testName + '.zip' })
        // http://192.168.3.25:5000/Z%E8%BD%AF%E4%BB%B6161/linux/
        let fileName = classGrade + '_' + course + '_' + testName + '.zip'
        let data = {
          url: fileBaseUrl + classGrade + '/' + course + '/' + fileName,
          name: fileName
        }
        console.log(data);

        res.send({ code: 0, data });

      }
    }
  });


});

/**
 * 获取学生信息
 */
router.get('/stus', function (req, res, next) {
  let { username, password } = req.query;
  AdminSchema.findOne({ username, password }, function (err, doc) {
    if (err) {
      res.send({ code: 1, msg: err });
    } else {
      if (doc === null) {
        res.send({ code: 1, msg: '请检查账号密码是否正确' });
      } else {
        StuSchema.find({ classGrade: doc.classGrade, status: 0 }, function (err, doc) {
          if (err) {
            res.send({ code: 1, msg: err });
          } else {
            res.send({ code: 0, data: doc });
          }
        });
      }
    }
  });
});

/**
 * 获取提交列表
 */
router.post('/jobs', function (req, res, next) {
  let { username, password, testName, courseId } = req.body;

  AdminSchema.findOne({ username, password }, function (err, doc) {
    if (err) {
      res.send({ code: 1, msg: err });
    } else {
      console.log(doc);

      if (doc === null) {
        res.send({ code: 1, msg: '请检查账号密码是否正确' });
      } else {
        JobSchema.find({ testName, courseId, classGrade: doc.classGrade }, function (err, doc) {
          if (err) {
            res.send({ code: 2, msg: err });
          } else {
            res.send({ code: 0, data: doc });
          }
        }).sort({ 'modifyAt': -1 });
      }
    }
  });
});

/**
 * 获取课程
 */
router.get('/courses', function (req, res, next) {
  CourseSchema.find({}, function (err, doc) {
    if (err) {
      res.send({ code: 1, msg: err });
    } else {
      res.send({ code: 0, data: doc });
    }
  });
});

/**
 * 保存文件信息
 */
router.post('/save', function (req, res, next) {
  let files = req.files.files;
  let { number, name, courseId, testName } = req.body;

  console.log(number, name, courseId, testName);

  StuSchema.findOne({ number, name }, function (err, doc) {
    if (err) {
      res.send({ code: 1, msg: err });
    } else {
      console.log(doc);
      // let classGrade = doc.classGrade;
      // 查找是否有这个学生
      if (doc === null) {
        res.send({ code: 2, msg: '查无此人' });
      } else {
        let classGrade = doc.classGrade;
        JobSchema.findOne({ number, name, courseId }, function (err, doc) {
          if (err) {
            res.send({ code: 1, msg: err });
          } else {
            let path = '';
            let prefix = '';
            if (courseId === '1') {
              // path = 'c://file//job//linux//' + testName + '//';
              path = basePath + classGrade + '/linux/' + testName + '/';
              prefix = 'linux_';
            }
            if (courseId === '2') {
              // path = 'c://file//job//net//' + testName + '//';
              path = basePath + classGrade + '/net/' + testName + '/';
              prefix = '网络管理_';
            }
            let fis = files.name.split('.');

            let suffix = fis[fis.length - 1];

            // 默认文件命名方式
            let fileName = prefix + number + '_' + name + '.' + suffix;

            if (courseId === '1' && testName === '实验1') {
              // linux 实验1文件命名
              fileName = classGrade + '-' + number + '-' + name + '-实验一 Linux常用命令.' + suffix;
            }

            console.log(path, fileName);

            if (doc === null) {
              // 如果没有这条信息则插入，第一次插入不包括文件名和更新时间
              JobSchema.insertMany({ number, name, courseId, testName, classGrade, fileName }, function (err, doc) {
                if (err) {
                  res.send({ code: 1, msg: err });
                } else {
                  _uploadFile(files, path, fileName, number);
                }
              })
            } else {
              // 如果有这条信息则更新这个条信息
              _uploadFile(files, path, fileName, number);
            }
          }
        });
      }

    }
  })

  /**
   * 文件上传
   * @param {*} files 
   * @param {*} path 
   * @param {*} fileName 
   * @param {*} number 
   */
  function _uploadFile(files, path, fileName, number) {
    files.mv(path + fileName, function (e) {
      if (e) {
        res.send({ code: 1, msg: e });
      } else {
        // 文件上传完毕后，更新文件的修改时间
        JobSchema.updateOne({ number }, { $set: { modifyAt: new Date() } }, (err, doc) => {
          if (err) {
            res.send({ code: 1, msg: e });
          } else {
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



});

module.exports = router;
