import {
  getNumberFromRange,
  getItemsFromArray} from './random.js';

const TIME_INTERVAL = {
  MIN_HOUR: 0,
  MAX_HOUR: 23,
  MIN_MINUTE: 0,
  MAX_MINUTE: 59
};

const OFFERS_INTERVAL = {
  MIN: 0,
  MAX: 2
};

const DESCRIPTIONS_INTERVAL = {
  MIN: 1,
  MAX: 3
};

const TYPES = {
  'Taxi': `🚕`,
  'Bus': `🚌`,
  'Train': `🚂`,
  'Ship': `🛳️`,
  'Transport': `🚊`,
  'Drive': `🚗`,
  'Flight': `✈️`,
  'Check-in': `🏨`,
  'Sightseeing': `🏛️`,
  'Restaurant': `🍴`
};

const DESCRIPTIONS = [
  `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  `Cras aliquet varius magna, non porta ligula feugiat eget.`,
  `Fusce tristique felis at fermentum pharetra.`,
  `Aliquam id orci ut lectus varius viverra.`,
  `Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante.`,
  `Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum.`,
  `Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui.`,
  `Sed sed nisi sed augue convallis suscipit in sed felis.`,
  `Aliquam erat volutpat.`,
  `Nunc fermentum tortor ac porta dapibus.`,
  `In rutrum ac purus sit amet tempus.`
];

const OFFERS = [
  `Add luggage`,
  `Switch to comfort class`,
  `Add meal`,
  `Choose seats`
];

const CITIES = [
  `Amsterdam`,
  `Geneva`,
  `Chamonix`,
  `Istambul`,
  `Venice`
];

const createSchedule = () => {
  const start = Date.now() + getNumberFromRange(TIME_INTERVAL.MIN_HOUR, TIME_INTERVAL.MAX_HOUR) * 60 * 60 * 1000;
  const end = start + (getNumberFromRange(TIME_INTERVAL.MIN_HOUR, TIME_INTERVAL.MAX_HOUR) * 60 + getNumberFromRange(TIME_INTERVAL.MIN_MINUTE, TIME_INTERVAL.MAX_MINUTE)) * 60 * 1000;

  const options = {
    hour12: false,
    hour: `numeric`,
    minute: `numeric`
  };

  return ({
    startTime: new Intl.DateTimeFormat(`en-US`, options).format(start),
    endTime: new Intl.DateTimeFormat(`en-US`, options).format(end),
    duration: new Intl.DateTimeFormat(`en-US`, options).format(end - start)
  });
};

const createOffers = () => {
  const offersName = getItemsFromArray(OFFERS.slice(), getNumberFromRange(OFFERS_INTERVAL.MIN, OFFERS_INTERVAL.MAX + 1));
  const offers = [];
  for (const offer of offersName) {
    const currentOffer = {
      name: offer,
      price: getNumberFromRange()
    };

    offers.push(currentOffer);
  }

  return offers;
};

const createDescription = () => getItemsFromArray(DESCRIPTIONS.slice(), getNumberFromRange(DESCRIPTIONS_INTERVAL.MIN, DESCRIPTIONS_INTERVAL.MAX + 1)).join(` `);

const createCurrentType = () => {
  const typeNames = Object.keys(TYPES);
  const type = typeNames[getNumberFromRange(0, typeNames.length - 1)];
  return ({
    title: type,
    icon: TYPES[type]
  });
};

const createPlace = () => CITIES[getNumberFromRange(0, CITIES.length - 1)];

export default () => ({
  type: createCurrentType(),
  place: createPlace(),
  schedule: createSchedule(),
  price: getNumberFromRange(),
  offers: createOffers(),
  description: createDescription()

});
