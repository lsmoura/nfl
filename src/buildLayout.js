const fs = require('fs');
const path = require('path');
const pug = require('pug');

const { readFile, writeFile } = require('./fileUtils');

const compilerFunction = pug.compileFile(path.join(__dirname, 'layout', 'game.pug'));

const filename = (number) => path.join(__dirname, '..', 'json', `${number}`.substr(0,4), `${number}.json`);
const outputFile = (number) => path.join(__dirname, '..', 'build', `${number}.html`);

async function retrieve(number) {
  const fn = filename(number);

  const rawData = await readFile(fn);
  const fullData = JSON.parse(rawData);
  const gameData = fullData[number];

  return gameData;
}

async function compileGame(number) {
  const data = await retrieve(number);
  const numberStr = `${number}`;
  const gameDate = `${numberStr.substr(0,4)}-${numberStr.substr(5,2)}-${numberStr.substr(7,2)}`;

  const fileContents = compilerFunction({
    game: {
      ...data,
      date: gameDate,
    },
  });

  return fileContents;
}

function compileData(data, number) {
  const numberStr = `${number}`;
  const gameDate = `${numberStr.substr(0,4)}-${numberStr.substr(5,2)}-${numberStr.substr(7,2)}`;

  const fileContents = compilerFunction({
    game: {
      ...data,
      date: gameDate,
    },
  });

  return fileContents;
}

// async function build(number) {
//   const fileContents = await compileGame(number);
//
//   return writeFile(outputFile(number), fileContents);
// }
//
// const gameNumber = '2018012101';
// build(gameNumber);

module.exports = compileData;
