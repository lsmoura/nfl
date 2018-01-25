const fs = require('fs');

function fsReadFile(file, options = 'utf8') {
  return new Promise((accept, reject) => {
    fs.readFile(file, options, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      accept(data);
    });
  });
}

function fsWriteFile(file, data, options) {
  return new Promise((accept, reject) => {
    fs.writeFile(file, data, options, (err) => {
      if (err) {
        reject(err);
        return;
      }

      accept();
    });
  });
}


module.exports.writeFile = fsWriteFile;
module.exports.readFile = fsReadFile;
