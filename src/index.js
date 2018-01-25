const run = require('./fetchAndSave');
const asyncUtils = require('./asyncUtils');

const parameters = process.argv.slice(2);

if (parameters.length < 1) {
  console.warn('we need at least one year to parse');
  return 1;
}

asyncUtils.arrayEach(parameters, run);
