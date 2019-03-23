import {
  getNumberFromRange,
  getItemsFromArray
} from './random.js';

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

const PICTURES_INTERVAL = {
  MIN: 2,
  MAX: 4
};

const TYPES = [
  {
    title: `Taxi`,
    icon: `🚕`,
    group: `transport`
  },
  {
    title: `Bus`,
    icon: `🚌`,
    group: `transport`
  },
  {
    title: `Train`,
    icon: `🚂`,
    group: `transport`
  },
  {
    title: `Ship`,
    icon: `🛳️`,
    group: `transport`
  },
  {
    title: `Transport`,
    icon: `🚊`,
    group: `transport`
  },
  {
    title: `Drive`,
    icon: `🚗`,
    group: `transport`
  },
  {
    title: `Flight`,
    icon: `✈️`,
    group: `transport`
  },
  {
    title: `Check-in`,
    icon: `🏨`,
    group: `service`
  },
  {
    title: `Sightseeing`,
    icon: `🏛️`,
    group: `service`
  },
  {
    title: `Restaurant`,
    icon: `🍴`,
    group: `service`
  }
];

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

const PLACES = [
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

const initOfferActive = () => {
  const active = getNumberFromRange();
  return active % 2 ? true : false;
};

const createOffer = (currentOffer) => ({
  name: currentOffer,
  price: getNumberFromRange(),
  active: initOfferActive()
});

const createOffers = () => {
  const offersName = getItemsFromArray(OFFERS.slice(), getNumberFromRange(OFFERS_INTERVAL.MIN, OFFERS_INTERVAL.MAX + 1));
  const offers = [];

  for (const offer of offersName) {
    offers.push(createOffer(offer));
  }

  return offers;
};

const createDescription = () => {
  const numberOfSentences = getNumberFromRange(DESCRIPTIONS_INTERVAL.MIN, DESCRIPTIONS_INTERVAL.MAX + 1);
  return getItemsFromArray(DESCRIPTIONS.slice(), numberOfSentences).join(` `);
};

const createCurrentType = () => {
  // const typeNames = Object.keys(TYPES);
  // const type = getNumberFromRange(0, TYPES.length - 1);

  // return ({
  //   title: type,
  //   icon: TYPES[type]
  // });
  return TYPES[getNumberFromRange(0, TYPES.length - 1)];
};

const createPlace = () => PLACES[getNumberFromRange(0, PLACES.length - 1)];

const createPictures = () => {
  const numberOfPictures = getNumberFromRange(PICTURES_INTERVAL.MIN, PICTURES_INTERVAL.MAX + 1);
  const pictures = [];
  for (let i = 0; i < numberOfPictures; i++) {
    pictures.push(`http://picsum.photos/300/150?r=${Math.random()}`);
  }

  return pictures;
};

export default () => ({
  type: createCurrentType(),
  place: createPlace(),
  schedule: createSchedule(),
  price: getNumberFromRange(),
  offers: createOffers(),
  description: createDescription(),
  pictures: createPictures(),
  types: TYPES,
  destinations: PLACES
});
