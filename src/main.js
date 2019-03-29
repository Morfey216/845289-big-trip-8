import pointData from './get-point-data.js';
import filtersData from './filters-data.js';
import Point from './point.js';
import EditPoint from './edit-point.js';
import Filter from './filter.js';

const START_AMOUNT_OF_POINTS = 7;

const filtersForm = document.querySelector(`.trip-filter`);
const tripPointsPosition = document.querySelector(`.trip-day__items`);

const renderFilters = (allFiltersData) => {
  filtersForm.innerHTML = ``;

  for (const itFilterData of allFiltersData) {
    const filterComponent = new Filter(itFilterData);

    filterComponent.onFilter = (evt) => {
      const filterCaption = evt.target.id || evt.target.htmlFor;
      filteredPoints(tripPoints, filterCaption);
    };

    const filterElement = filterComponent.render();
    filtersForm.appendChild(filterElement);
  }
};

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
renderFilters(filtersData());

const filteredPoints = (points, filter) => {
  let newTripPoints;
  switch (filter) {
    case `filter-everything`:
      newTripPoints = points;
      break;
    case `filter-future`:
      newTripPoints = points.filter((it) => it.schedule.startTime > Date.now());
      break;
    case `filter-past`:
      newTripPoints = points.filter((it) => it.schedule.startTime < Date.now());
      break;
  }
  renderTripPoints(tripPointsPosition, newTripPoints);
};
