require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fetch = require('./fetcher');
const asyncUtils = require('./asyncUtils');

const arrayMap = asyncUtils.arrayMap;
const arrayEach = asyncUtils.arrayEach;

const number = 2018012100;
const urlGenerator = (number) => `http://www.nfl.com/liveupdate/game-center/${number}/${number}_gtd.json`

const jsondir = path.join(__dirname, '..', 'json');

const fetchJson = (url) => fetch(url).then(result => JSON.parse(result));
const fetchText = (url) => fetch(url);

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

async function weekGames(season, seasonType, week) {
  const url = `http://www.nfl.com/ajax/scorestrip?season=${season}&seasonType=${seasonType}&week=${week}`;

  const result = await fetchText(url);

  const entries = result.match(/<g [^>]*>/g);
  if (!entries) {
    console.warn('no entries found.');
    console.warn(url);
    console.warn(result);
    fetch.cache.del(url);
    return null;
  }

  const formattedEntries = entries.map(entry => {
    const content = entry.replace(/<[^ ]* */g, '').replace(/ *\/?>/g, '');
    const keys = content.split('" ');
    const result = {};
    keys.forEach(k => {
      const [key, value] = k.split('=');
      if (!value) {
        console.warn('can\'t split string', k);
        console.warn(entry);
      }
      result[key] = value.replace(/(^"|"$)/g, '');
    });

    return result;
  });

  await fsWriteFile(
    path.join(jsondir, `${season}${seasonType}${week}.json`),
    JSON.stringify(formattedEntries, null, 2),
    'utf-8'
  );

  return formattedEntries;
}

async function execute(number) {
  const url = urlGenerator(number);

  const result = await fetchJson(url);

  const data = JSON.stringify(result, null, 2);

  return fsWriteFile(path.join(jsondir, `${number}`.substr(0,4), `${number}.json`), data, 'utf8');
}

async function saveGames(season, seasonType, week) {
  const entries = await weekGames(season, seasonType, week);
  if (!entries) return false;
  const games = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const game = await execute(entry.eid);
    games.push(game);
  }

  return games;
}

const preWeeks = [0, 1, 2, 3, 4];
const regWeeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const proWeeks = [21];
const postWeeks = [18, 19, 20, 22];
const seasonTypes = ['PRE', 'REG', 'PRO', 'POST'];
const weeksMap = {
  PRE: preWeeks,
  REG: regWeeks,
  PRO: proWeeks,
  POST: postWeeks,
};

async function fetchSeasonType(year, seasonType) {
  const weeks = weeksMap[seasonType];

  if (!weeks) throw new Error(`cannot find weeks information for ${seasonType}`);

  await arrayEach(weeks, async (week) => {
    await saveGames(year, seasonType, week);
  });
}

async function run(year) {
  console.log(`Fetching data for ${year} games`);
  const returnValue = await arrayEach(seasonTypes, async (type) => await fetchSeasonType(year, type));
  fetch.disconnect();

  return returnValue;
}

module.exports = run;
