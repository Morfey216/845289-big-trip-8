import makeFilter from './make-filter.js';
import makePoint from './make-point.js';

const START_AMOUNT_OF_POINTS = 7;

const filtersPosition = document.querySelector(`.trip-filter`);
const tripPointsPosition = document.querySelector(`.trip-day__items`);

filtersPosition.insertAdjacentHTML(`beforeend`, makeFilter(`Everything`, true));
filtersPosition.insertAdjacentHTML(`beforeend`, makeFilter(`Future`));
filtersPosition.insertAdjacentHTML(`beforeend`, makeFilter(`Past`));

const renderTripPoints = (dist, amount) => {
  const points = new Array(amount)
    .fill()
    .map(makePoint);
  dist.insertAdjacentHTML(`beforeend`, points.join(``));
};

renderTripPoints(tripPointsPosition, START_AMOUNT_OF_POINTS);
