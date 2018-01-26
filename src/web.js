const metalsmith = require('metalsmith');
const path = require('path');

const { arrayEach } = require('./asyncUtils');
const htmlBuilder = require('./buildLayout');

const players = {};

function filterRoot() {
  return (files, metalsmith, done) => {
    const years = {};

    Object.keys(files).forEach(fileKey => {
      const file = files[fileKey];
      if (fileKey.indexOf('/') >= 0) {
        file.layout = 'game';
      } else {
        file.layout = 'game-list';

        const year = parseInt(fileKey.substr(0,4), 10);
        file.year = year;

        if (!years[year]) years[year] = [];
        years[year].push(fileKey);
      }
    });

    Object.keys(years).forEach(year => {
      files[`${year}/index.html`] = {
        layout: 'year',
        files: years[year],
        mode: '0644',
        content: '',
      };
    });

    done();
  };
}

function processGames() {
  return async (files, metalsmith, done) => {
    const gameFiles = Object.keys(files)
      .filter(fileKey => files[fileKey].layout === 'game');
    await arrayEach(
      gameFiles,
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
            source: gameContents,
            key: gameKey,
            layout: 'game',
          };
          const newFileName = fileKey.replace('.json', '/index.html');
          files[newFileName] = newFile;
          delete files[fileKey];
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
