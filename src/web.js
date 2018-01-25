const metalsmith = require('metalsmith');
const path = require('path');

const { arrayEach } = require('./asyncUtils');
const htmlBuilder = require('./buildLayout');

function filterRoot() {
  return (files, metalsmith, done) => {
    Object.keys(files).forEach(file => {
      if (file.indexOf('/') >= 0) {
        file.layout = 'game';
      } else {
        file.layout = 'game-list';
      }
    });

    done();
  };
}

function processGames() {
  return async (files, metalsmith, done) => {
    await arrayEach(
      Object.keys(files).filter(fileKey => files[fileKey].layout === 'game'),
      async (fileKey) => {
        const file = files[fileKey];
        const number = fileKey.replace(/\/([0-9]*)\.json/, '$1').substr(0, 10);

        const contents = file.contents.toString();
        const parsedContents = JSON.parse(contents);
        const gameKey = Object.keys(parsedContents)[0];
        const gameContents = parsedContents[gameKey];

        if (!gameContents) {
          console.error('no content.');
          console.error(number);
          console.error(`gameKey: ${gameKey}`);
          console.error(Object.keys(parsedContents));
          return null;
        }

        try {
          const result = htmlBuilder(gameContents, number);
          const newFile = {
            contents: result,
            mode: '0644',
          };
          const newFileName = fileKey.replace('.json', '/index.html');
          files[newFileName] = newFile;
        } catch (err) {
          console.error(`cannot process file ${fileKey}`);
          console.error(err);
          console.error(Object.keys(gameContents));
          // console.error(contents);
        }
      }
    );

    done();
  };
}

metalsmith(path.join(__dirname, '..', 'json'))
  .source('.')
  .destination(path.join(__dirname, '..', 'build'))
  .clean(true)
  .use(filterRoot())
  .use(processGames())
  .build(err => {
    if (err) throw(err);
  });
