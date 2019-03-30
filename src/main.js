import pointData from './get-point-data.js';
import filtersData from './filters-data.js';
import Point from './point.js';
import EditPoint from './edit-point.js';
import Filter from './filter.js';
import Statistic from './statistic.js';

const START_AMOUNT_OF_POINTS = 7;

const filtersForm = document.querySelector(`.trip-filter`);
const tripPointsPosition = document.querySelector(`.trip-day__items`);

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

const renderTripPoints = (dist, allPointsData, filteredPointData) => {
  tripPointsPosition.innerHTML = ``;
  const pointFragment = document.createDocumentFragment();

  for (const itPointData of filteredPointData) {
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
  renderTripPoints(tripPointsPosition, points, newTripPoints);
};

const renderFilters = (allFiltersData) => {
  filtersForm.innerHTML = ``;

  for (const itFilterData of allFiltersData) {
    const filterComponent = new Filter(itFilterData);

    filterComponent.onFilter = (evt) => {
      const filterCaption = evt.target.htmlFor;
      filteredPoints(tripPoints, filterCaption);
    };

    const filterElement = filterComponent.render();
    filtersForm.appendChild(filterElement);
  }
};

const getTripPoints = (amount) => new Array(amount).fill().map(pointData);
const tripPoints = getTripPoints(START_AMOUNT_OF_POINTS);

renderTripPoints(tripPointsPosition, tripPoints, tripPoints);
renderFilters(filtersData());

const mainSection = document.querySelector(`.main`);

const statistic = new Statistic(tripPoints);
mainSection.parentNode.appendChild(statistic.render());

const tableButton = document.querySelector(`.view-switch__item[href="#table"]`);
const statisticButton = document.querySelector(`.view-switch__item[href="#stats"]`);
const statisticSection = document.querySelector(`.statistic`);

const onTableButtonClick = (evt) => {
  evt.preventDefault();

  tableButton.classList.add(`view-switch__item--active`);
  statisticButton.classList.remove(`view-switch__item--active`);

  mainSection.classList.remove(`visually-hidden`);
  statisticSection.classList.add(`visually-hidden`);

  renderTripPoints(tripPointsPosition, tripPoints, tripPoints);
};

const onStatisticButtonClick = (evt) => {
  evt.preventDefault();

  tableButton.classList.remove(`view-switch__item--active`);
  statisticButton.classList.add(`view-switch__item--active`);

  mainSection.classList.add(`visually-hidden`);
  statisticSection.classList.remove(`visually-hidden`);

  statistic.renderCharts();
};

tableButton.addEventListener(`click`, onTableButtonClick);
statisticButton.addEventListener(`click`, onStatisticButtonClick);
