import makeFilter from './make-filter.js';
import makePoint from './make-point.js';

const START_AMOUNT_OF_POINTS = 7;
const MAX_RANDOM_OF_POINTS = 15;

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

const clearTripPoints = () => {
  while (tripPointsPosition.firstChild) {
    tripPointsPosition.removeChild(tripPointsPosition.firstChild);
  }
};

const initFilterButton = (filterButton) => {
  const onFilterButtonClick = () => {
    let amountOfPoints;
    switch (filterButton.id) {
      case `filter-everything`:
        amountOfPoints = Math.floor(Math.random() * MAX_RANDOM_OF_POINTS);
        break;
      case `filter-future`:
        amountOfPoints = Math.floor(Math.random() * MAX_RANDOM_OF_POINTS);
        break;
      case `filter-past`:
        amountOfPoints = Math.floor(Math.random() * MAX_RANDOM_OF_POINTS);
        break;
    }
    clearTripPoints();
    renderTripPoints(tripPointsPosition, amountOfPoints);
  };

  filterButton.addEventListener(`click`, onFilterButtonClick);
};

const filterButtons = filtersPosition.querySelectorAll(`input`);

filterButtons.forEach(initFilterButton);
