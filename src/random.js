export const getRandomInteger = (minNumber = 1, maxNumber = 100) => Math.floor(Math.random() * (maxNumber - minNumber)) + minNumber;

export const getItemsList = (array, number) => {
  const resultList = [];

  while (resultList.length < number) {
    const randomItemIndex = getRandomInteger(0, array.length);
    const newItem = array.splice(randomItemIndex, 1)[0];
    resultList.push(newItem);
  }

  return resultList;
};
