const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');
const readFile = Promise.promisify(fs.readFile);

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, (err) => {
      if (err) {
        throw (err);
      } else {
        callback(null, { id, text });
      }
    });
  });
};

exports.readAll = (callback) => {
  fs.readdir (exports.dataDir, 'utf8', (err, files) => {
    if (err) {
      return callback(err);
    }
    var data = _.map(files, (file) => {
      var id = path.basename(file, '.txt');
      var filePath = path.join(exports.dataDir, file);
      return readFile(filePath).then((fileData) => {
        return {
          id: id,
          text: fileData.toString()
        };
      });
    });
    Promise.all(data)
      .then((items) => callback(null, items), err => callback(err));
  });
};

exports.readOne = (id, callback) => {
  fs.readFile(`${exports.dataDir}/${id}.txt`, 'utf8', (err, text) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, { id, text });
    }
  });
};

exports.update = (id, text, callback) => {
  fs.access(path.join(exports.dataDir, `${id}.txt`), (err) => {
    if (err) {
      callback(err, null);
    } else {
      fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, (err) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  fs.access(path.join(exports.dataDir, `${id}.txt`), (err) => {
    if (err) {
      callback(err, null);
    } else {
      fs.unlink(path.join(exports.dataDir, `${id}.txt`), (err) =>{
        if (err) {
          callback(err, null);
        } else {
          callback();
        }
      });
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
