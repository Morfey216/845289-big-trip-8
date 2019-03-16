export const getNumberFromRange = (minNumber = 1, maxNumber = 100) => Math.floor(Math.random() * (maxNumber - minNumber)) + minNumber;

export const getItemsFromArray = (array, number) => {
  const resultArray = [];

  for (let i = 0; i < number; i++) {
    resultArray.push(array.splice(getNumberFromRange(0, array.length), 1)[0]);
  }

  return resultArray;
};
