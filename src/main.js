import makeFilter from './make-filter.js';
// import makePoint from './make-point.js';
import pointData from './get-point-data.js';
import Point from './point.js';

const START_AMOUNT_OF_POINTS = 7;
const MAX_RANDOM_OF_POINTS = 15;

const filtersPosition = document.querySelector(`.trip-filter`);
const tripPointsPosition = document.querySelector(`.trip-day__items`);

filtersPosition.insertAdjacentHTML(`beforeend`, makeFilter(`Everything`, true));
filtersPosition.insertAdjacentHTML(`beforeend`, makeFilter(`Future`));
filtersPosition.insertAdjacentHTML(`beforeend`, makeFilter(`Past`));

// const renderTripPoints = (dist, allPoints) => {
//   dist.insertAdjacentHTML(`beforeend`, allPoints.map(makePoint).join(``));
// };

const renderTripPoints = (dist, allPoints) => {
  // dist.insertAdjacentHTML(`beforeend`, allPoints.map(makePoint).join(``));
  for (const point of allPoints) {
    const newPoint = new Point(point);
    newPoint.render(dist);
  }
};

const getTripPoints = (amount) => new Array(amount).fill().map(pointData);

const tripPoints = getTripPoints(START_AMOUNT_OF_POINTS);

renderTripPoints(tripPointsPosition, tripPoints);

const clearTripPoints = () => {
  while (tripPointsPosition.firstChild) {
    tripPointsPosition.removeChild(tripPointsPosition.firstChild);
  }
};

const initFilterButton = (filterButton) => {
  const onFilterButtonClick = () => {
    let newTripPoints;
    switch (filterButton.id) {
      case `filter-everything`:
        newTripPoints = getTripPoints(Math.floor(Math.random() * MAX_RANDOM_OF_POINTS));
        break;
      case `filter-future`:
        newTripPoints = getTripPoints(Math.floor(Math.random() * MAX_RANDOM_OF_POINTS));
        break;
      case `filter-past`:
        newTripPoints = getTripPoints(Math.floor(Math.random() * MAX_RANDOM_OF_POINTS));
        break;
    }
    clearTripPoints();
    renderTripPoints(tripPointsPosition, newTripPoints);
  };

  filterButton.addEventListener(`click`, onFilterButtonClick);
};

const filterButtons = filtersPosition.querySelectorAll(`input`);

filterButtons.forEach(initFilterButton);

// const firstTask = new Point(pointData);
// firstTask.render(tripPointsPosition);
