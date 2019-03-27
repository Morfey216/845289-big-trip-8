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

const updatePointData = (points, pointToUpdate, newPoint) => {
  const index = points.findIndex((it) => it === pointToUpdate);
  points[index] = Object.assign({}, pointToUpdate, newPoint);
  return points[index];
};

const deletePointData = (points, point) => {
  const index = points.findIndex((it) => it === point);
  points.splice(index, 1);
  return points;
};

const renderTripPoints = (dist, allPointsData) => {
  tripPointsPosition.innerHTML = ``;
  const pointFragment = document.createDocumentFragment();

  for (const itPointData of allPointsData) {
    const pointComponent = new Point(itPointData);
    const editPointComponent = new EditPoint(itPointData);

    pointComponent.onEdit = () => {
      editPointComponent.render();
      dist.replaceChild(editPointComponent.element, pointComponent.element);
      pointComponent.unrender();
    };

    editPointComponent.onSave = (newObject) => {
      const updatedPoint = updatePointData(allPointsData, itPointData, newObject);

      pointComponent.update(updatedPoint);
      pointComponent.render();
      dist.replaceChild(pointComponent.element, editPointComponent.element);
      editPointComponent.unrender();
    };

    editPointComponent.onReset = () => {
      pointComponent.render();
      dist.replaceChild(pointComponent.element, editPointComponent.element);
      editPointComponent.unrender();
    };

    editPointComponent.onDelete = () => {
      dist.removeChild(editPointComponent.element);
      editPointComponent.unrender();
      deletePointData(allPointsData, itPointData);
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
