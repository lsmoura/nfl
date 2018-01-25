async function arrayEach(array, func) {
  for (let i = 0; i < array.length; i++) {
    await func(array[i]);
  }
}

async function arrayMap(array, func) {
  const returnArray = [];
  for (let i = 0; i < array.length; i++) {
    returnArray.push(await func(array[i]));
  }

  return returnArray;
}

module.exports.arrayMap = arrayMap;
module.exports.arrayEach = arrayEach;
