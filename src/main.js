import moment from 'moment';
import API from './api.js';
import Provider from './provider.js';
import Store from './store.js';
import TYPES from './types.js';
import filtersData from './filters-data.js';
import Day from './day.js';
import Point from './point.js';
import EditPoint from './edit-point.js';
import Filter from './filter.js';
import Sorting from './sorting.js';
import Statistic from './statistic.js';
import TotalCost from './total-cost.js';

const AUTHORIZATION = `Basic eo0w590ik37389a`;
const END_POINT = `https://es8-demo-srv.appspot.com/big-trip`;
const POINTS_STORE_KEY = `points-store-key`;

const api = new API({endPoint: END_POINT, authorization: AUTHORIZATION});
const store = new Store({key: POINTS_STORE_KEY, storage: localStorage});
const provider = new Provider({api, store, generateId: () => String(Date.now())});

const mainSection = document.querySelector(`.main`);
const tableButton = document.querySelector(`.view-switch__item[href="#table"]`);
const statisticButton = document.querySelector(`.view-switch__item[href="#stats"]`);
const filtersForm = document.querySelector(`.trip-filter`);
const tripDaysBlock = document.querySelector(`.trip-points`);
const tripDayItemsBlock = document.querySelector(`.trip-day__items`);
const totalCostElement = document.querySelector(`.trip__total`);

let destinationsKit = [];
let offersKit = [];
let offersNameKit = [];
let offersLabelKit = [];
let tripPoints = [];
let statistic = null;
let tripTotalCost = 0;
const cost = new TotalCost(tripTotalCost);
const daysPointsData = new Map();
let daysDateKit = [];

window.addEventListener(`offline`, () => {
  document.title = `${document.title}[OFFLINE]`;
});

window.addEventListener(`online`, () => {
  document.title = document.title.split(`[OFFLINE]`)[0];
  provider.syncPoints();
});

const updatePointData = (pointToUpdate, newPoint) => {
  const index = tripPoints.findIndex((it) => it === pointToUpdate);
  Object.assign(tripPoints[index], pointToUpdate, newPoint);
  return tripPoints[index];
};

const deletePointData = (point) => {
  const index = tripPoints.findIndex((it) => it === point);
  tripPoints.splice(index, 1);
  return tripPoints;
};

const deleteDaysDate = (date) => {
  daysPointsData.delete(date);
};

const updateDaysDate = () => {
  createDaysDateKit();
  renderDays();
};

const getDayDate = (pointData) => {
  return moment(pointData.schedule.startTime).format(`MMM DD`);
};

const renderTripPoints = (dist, fractionPointsData = tripPoints) => {
  dist.innerHTML = ``;
  const pointFragment = document.createDocumentFragment();

  for (const itPointData of fractionPointsData) {
    const pointComponent = new Point(itPointData);
    const editPointComponent = new EditPoint(itPointData);

    pointComponent.onEdit = () => {
      editPointComponent.render();
      dist.replaceChild(editPointComponent.element, pointComponent.element);
      pointComponent.unrender();
    };

    editPointComponent.onSave = (newObject) => {
      const updatedPoint = updatePointData(itPointData, newObject);
      const currentPointCost = (updatedPoint.fullCost);

      editPointComponent.formActivate().showSaveButtonText(`Saving...`);
      editPointComponent.formActivate().block();

      const unblock = () => {
        editPointComponent.formActivate().showSaveButtonText(`Save`);
        editPointComponent.formActivate().unblock();
      };

      provider.updatePoint({id: updatedPoint.id, data: updatedPoint.toRAW()})
        .then((newPoint) => {
          unblock();
          createFullPointData(newPoint);
          const newUpdatedPoint = updatePointData(itPointData, newPoint);
          const newPointCost = newUpdatedPoint.fullCost;

          tripTotalCost = tripTotalCost + newPointCost - currentPointCost;
          renderTripTotalCost(tripTotalCost);
          const dayDate = getDayDate(newUpdatedPoint);

          if (dayDate !== dist.parentNode.querySelector(`.trip-day__title`).textContent) {
            createDaysPointsData(tripPoints);
            renderDays();
          } else {
            pointComponent.update(newPoint);
            pointComponent.render();
            dist.replaceChild(pointComponent.element, editPointComponent.element);
            editPointComponent.unrender();
          }
        })
        .catch(() => {
          editPointComponent.formActivate().showError();
          unblock();
        });
    };

    editPointComponent.onReset = () => {
      pointComponent.render();
      dist.replaceChild(pointComponent.element, editPointComponent.element);
      editPointComponent.unrender();
    };

    editPointComponent.onDelete = ({id}) => {
      editPointComponent.formActivate().showDeleteButtonText(`Deleting...`);
      editPointComponent.formActivate().block();

      const unblock = () => {
        editPointComponent.formActivate().showDeleteButtonText(`Delete`);
        editPointComponent.formActivate().unblock();
      };

      provider.deletePoint({id})
        .then(() => {
          unblock();
          dist.removeChild(editPointComponent.element);
          editPointComponent.unrender();
          const dayDate = getDayDate(itPointData);
          deletePointData(itPointData);

          if (dist.childElementCount === 0) {
            dist.parentNode.parentNode.removeChild(dist.parentNode);
            deleteDaysDate(dayDate);
            updateDaysDate();
          }

          tripTotalCost = tripTotalCost - itPointData.fullCost;
          renderTripTotalCost(tripTotalCost);
        })
        .catch(() => {
          editPointComponent.formActivate().showError();
          unblock();
        });
    };

    pointFragment.appendChild(pointComponent.render());
  }

  dist.appendChild(pointFragment);
};

const renderStatistic = (points) => {
  statistic = new Statistic(points);
  mainSection.parentNode.appendChild(statistic.render());
  statistic.renderCharts();

  const statisticSection = document.querySelector(`.statistic`);

  const onTableButtonClick = (evt) => {
    evt.preventDefault();

    tableButton.classList.add(`view-switch__item--active`);
    statisticButton.classList.remove(`view-switch__item--active`);

    mainSection.classList.remove(`visually-hidden`);
    statisticSection.classList.add(`visually-hidden`);
  };

  const onStatisticButtonClick = (evt) => {
    evt.preventDefault();

    tableButton.classList.remove(`view-switch__item--active`);
    statisticButton.classList.add(`view-switch__item--active`);

    mainSection.classList.add(`visually-hidden`);
    statisticSection.classList.remove(`visually-hidden`);

    statistic.update(tripPoints);
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
        newTripPoints = points.filter((it) => it.schedule.endTime < Date.now());
        break;
    }
    createDaysPointsData(newTripPoints);
    renderDays();
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

const renderTripTotalCost = (currentTotalCost) => {
  cost.update(currentTotalCost);
  const costElement = cost.render();
  totalCostElement.replaceChild(costElement, totalCostElement.lastChild);
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
    labelsKit.push(it.toLowerCase().replace(/[' ]/g, `-`).replace(/,/g, ``));
  });

  return labelsKit;
};

const getDestinationsKit = (kit) => {
  destinationsKit = kit;
};

const getOffersKit = (kit) => {
  offersKit = kit;
  offersNameKit = createOffersNameKit(offersKit);
  offersLabelKit = createOffersLabelKit(offersNameKit);
};

const createFullOffersData = () => {
  for (const currentOffer of offersKit) {
    const index = TYPES.findIndex((it) => it.title.toLowerCase() === currentOffer.type);
    currentOffer.title = TYPES[index].title;
    currentOffer.icon = TYPES[index].icon;
    currentOffer.group = TYPES[index].group;
  }
};

const countOffersCost = (offers) => {
  const offersCost = offers.filter((offer) => offer.accepted).reduce((acc, offer) => acc + offer.price, 0);
  return offersCost;
};

const countPointCost = (point) => {
  const offersCost = countOffersCost(point.offers);
  const pointCost = +point.price + offersCost;
  return pointCost;
};

const createFullPointData = (point) => {
  point.destinations = destinationsKit;
  point.types = offersKit;
  point.type = createType(point);
  point.offersNameKit = offersNameKit;
  point.offersLabelKit = offersLabelKit;
  point.fullCost = countPointCost(point);
};

const initNewDaysPointsData = (date) => {
  if (!daysPointsData.has(date)) {
    daysPointsData.set(date, []);
  }
};

const createFullPointsData = () => {
  tripPoints.forEach((it) => {
    createFullPointData(it);
    tripTotalCost += it.fullCost;
  });
};

const createDaysDateKit = () => {
  daysDateKit = Array.from(daysPointsData.keys()).sort((first, second) => moment(first, `MMM DD`) - moment(second, `MMM DD`));
};

const createDaysPointsData = (points) => {
  daysPointsData.clear();

  for (const point of points) {
    const date = getDayDate(point);
    initNewDaysPointsData(date);

    const dayPoints = daysPointsData.get(date);
    dayPoints.push(point);
    daysPointsData.set(date, dayPoints);
  }

  createDaysDateKit();
};

const renderDays = () => {
  const daysFragment = document.createDocumentFragment();

  for (let i = 0; i < daysDateKit.length; i++) {
    const dayComponent = new Day(i + 1, daysDateKit[i]);
    const dayComponentElement = dayComponent.render();
    daysFragment.appendChild(dayComponentElement);

    const currentDayItemsBlock = dayComponent.element.querySelector(`.trip-day__items`);
    renderTripPoints(currentDayItemsBlock, daysPointsData.get(daysDateKit[i]));
  }

  tripDaysBlock.innerHTML = ``;
  tripDaysBlock.appendChild(daysFragment);
};

const initRender = () => {
  createFullOffersData();
  createFullPointsData();
  createDaysPointsData(tripPoints);
  renderDays();
  renderTripTotalCost(tripTotalCost);
  renderStatistic(tripPoints);
  renderFilters(filtersData(), tripPoints);
};

const loadData = () => {
  const loadErrorText = `Something went wrong while loading your route info. Check your connection or try again later`;
  tripDayItemsBlock.textContent = `Loading route...`;
  provider.getDestinations()
  .then((destinations) => {
    getDestinationsKit(destinations);
  })
  .then(() => {
    provider.getOffers()
    .then((offers) => {
      getOffersKit(offers);
    })
    .catch(() => {
      tripDayItemsBlock.textContent = loadErrorText;
    });
  })
  .then(() => {
    provider.getPoints()
    .then((points) => {
      tripPoints = points;
      initRender();
    });
  })
  .catch(() => {
    tripDayItemsBlock.textContent = loadErrorText;
  });
};

loadData();
