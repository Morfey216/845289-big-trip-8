import makeFilter from './make-filter.js';
// import makePoint from './make-point.js';
import pointData from './get-point-data.js';
import Point from './point.js';
import EditPoint from './edit-point.js';

const START_AMOUNT_OF_POINTS = 7;
const MAX_RANDOM_OF_POINTS = 15;

const filtersPosition = document.querySelector(`.trip-filter`);
const tripPointsPosition = document.querySelector(`.trip-day__items`);

filtersPosition.insertAdjacentHTML(`beforeend`, makeFilter(`Everything`, true));
filtersPosition.insertAdjacentHTML(`beforeend`, makeFilter(`Future`));
filtersPosition.insertAdjacentHTML(`beforeend`, makeFilter(`Past`));

const renderTripPoints = (dist, allPoints) => {
  const pointFragment = document.createDocumentFragment();

  for (const point of allPoints) {
    const pointComponent = new Point(point);
    const editPointComponent = new EditPoint(point);

    pointComponent.onEdit = () => {
      editPointComponent.render();
      dist.replaceChild(editPointComponent.element, pointComponent.element);
      pointComponent.unrender();
    };

    editPointComponent.onSave = () => {
      pointComponent.render();
      dist.replaceChild(pointComponent.element, editPointComponent.element);
      editPointComponent.unrender();
    };

    pointFragment.appendChild(pointComponent.render());
  }

  dist.appendChild(pointFragment);
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
