import API from './api.js';
import {TYPES} from './get-point-data.js';
import filtersData from './filters-data.js';
import Point from './point.js';
import EditPoint from './edit-point.js';
import Filter from './filter.js';
import Statistic from './statistic.js';

const AUTHORIZATION = `Basic eo0w590ik37599a${Math.random()}`;
const END_POINT = `https://es8-demo-srv.appspot.com/big-trip`;

const api = new API({endPoint: END_POINT, authorization: AUTHORIZATION});

const mainSection = document.querySelector(`.main`);
const tableButton = document.querySelector(`.view-switch__item[href="#table"]`);
const statisticButton = document.querySelector(`.view-switch__item[href="#stats"]`);
const filtersForm = document.querySelector(`.trip-filter`);
const tripDayItemsBlock = document.querySelector(`.trip-day__items`);

let destinationsKit = null;
let offersKit = null;
let tripPoints = [];
let statistic = null;

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

const renderTripPoints = (dist, allPointsData, filteredPointData = tripPoints) => {
  tripDayItemsBlock.innerHTML = ``;
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

    editPointComponent.onDelete = ({id}) => {
      api.deletePoint({id})
      .then(() => {
        dist.removeChild(editPointComponent.element);
        editPointComponent.unrender();
        deletePointData(allPointsData, itPointData);
        // временная вставка
        api.getPoints()
          .then((points) => {
            console.log(points);
          });

      });
    };

    pointFragment.appendChild(pointComponent.render());
  }

  dist.appendChild(pointFragment);
};

const getDestinationsKit = (kit) => {
  destinationsKit = kit;
};

const getOffersKit = (kit) => {
  offersKit = kit;
};

const renderStatistic = (points) => {
  statistic = new Statistic(points);
  mainSection.parentNode.appendChild(statistic.render());

  const statisticSection = document.querySelector(`.statistic`);

  const onTableButtonClick = (evt) => {
    evt.preventDefault();

    tableButton.classList.add(`view-switch__item--active`);
    statisticButton.classList.remove(`view-switch__item--active`);

    mainSection.classList.remove(`visually-hidden`);
    statisticSection.classList.add(`visually-hidden`);

    renderTripPoints(tripDayItemsBlock, tripPoints);
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
};

const renderFilters = (allFiltersData, allPoints) => {
  filtersForm.innerHTML = ``;

  const filteredPoints = (points, filter) => {
    let newTripPoints = [];
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
    renderTripPoints(tripDayItemsBlock, points, newTripPoints);
  };

  for (const itFilterData of allFiltersData) {
    const filterComponent = new Filter(itFilterData);

    filterComponent.onFilter = (evt) => {
      const filterCaption = evt.target.htmlFor;
      filteredPoints(allPoints, filterCaption);
    };

    const filterElement = filterComponent.render();
    filtersForm.appendChild(filterElement);
  }
};

const createType = (itPoint) => {
  const index = itPoint.types.findIndex((it) => it.type === itPoint.typeTitle);
  const type = itPoint.types[index];

  return type;
};

const createOffersNameKit = (kit) => {
  const offersList = new Set();
  kit.forEach((it) => {
    it.offers.forEach((offer) => offersList.add(offer.name));
  });

  return [...offersList];
};

const createOffersLabelKit = (namesKit) => {
  const labelsKit = [];
  namesKit.forEach((it) => {
    labelsKit.push(it.toLowerCase().replace(/ /g, `-`).replace(/,/g, ``).replace(/'/g, `-`));
  });

  return labelsKit;
};

const createFullPointData = (point) => {
  point.destinations = destinationsKit;
  point.types = offersKit;
  point.type = createType(point);
  point.offersNameKit = createOffersNameKit(offersKit);
  point.offersLabelKit = createOffersLabelKit(point.offersNameKit);
};

const createFullPointsData = () => {
  for (const currentOffer of offersKit) {
    const index = TYPES.findIndex((it) => it.title.toLowerCase() === currentOffer.type);
    currentOffer.title = TYPES[index].title;
    currentOffer.icon = TYPES[index].icon;
    currentOffer.group = TYPES[index].group;
  }

  tripPoints.forEach((it) => createFullPointData(it));
};

const initRender = () => {
  createFullPointsData();
  console.log(tripPoints);
  renderTripPoints(tripDayItemsBlock, tripPoints);
  renderStatistic(tripPoints);
  renderFilters(filtersData(), tripPoints);
};

const loadData = () => {
  tripDayItemsBlock.textContent = `Loading route...`;
  api.getDestinations()
  .then((destinations) => {
    getDestinationsKit(destinations);
  })
  .then(() => {
    api.getOffers()
    .then((offers) => {
      getOffersKit(offers);
    });
  })
  .then(() => {
    api.getPoints()
    .then((points) => {
      tripPoints = points;
      initRender();
    });
  });
};

loadData();
