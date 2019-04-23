import {TYPES, FILTER_CAPTIONS, SORTING_CAPTIONS} from './data.js';
import {getControlItems} from './util.js';
import API from './api.js';
import Provider from './provider.js';
import Store from './store.js';
import Day from './day.js';
import Point from './point.js';
import EditPoint from './edit-point.js';
import Filter from './filter.js';
import Sorting from './sorting.js';
import Statistic from './statistic.js';
import TotalCost from './total-cost.js';
import moment from 'moment';

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
const sortingForm = document.querySelector(`.trip-sorting`);
const sortingOffersItem = document.querySelector(`.trip-sorting__item--offers`);
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
let activeFilterCaption = `filter-everything`;
let activeSortingCaption = `sorting-event`;

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
            const actualPoints = getFilteredPoints(tripPoints, activeFilterCaption);
            createDaysPointsData(actualPoints);
            renderDays();
          } else {
            pointComponent.update(newPoint);
            pointComponent.render();
            dist.replaceChild(pointComponent.element, editPointComponent.element);
            editPointComponent.unrender();
          }
          sortPoints(daysPointsData, activeSortingCaption);
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

const getFilteredPoints = (points, filter) => {
  let resultPoints = [];
  switch (filter) {
    case `filter-everything`:
      activeFilterCaption = `filter-everything`;
      resultPoints = points;
      break;
    case `filter-future`:
      activeFilterCaption = `filter-future`;
      resultPoints = points.filter((it) => it.schedule.startTime > Date.now());
      break;
    case `filter-past`:
      activeFilterCaption = `filter-past`;
      resultPoints = points.filter((it) => it.schedule.endTime < Date.now());
      break;
  }
  return resultPoints;
};

const renderFilters = (allFiltersData, allPoints) => {
  filtersForm.innerHTML = ``;

  const filteredPoints = (filter) => {
    const newTripPoints = getFilteredPoints(allPoints, filter);
    createDaysPointsData(newTripPoints);
    if (activeSortingCaption !== `sorting-event`) {
      sortPoints(daysPointsData, activeSortingCaption);
    } else {
      renderDays();
    }
  };

  for (const itFilterData of allFiltersData) {
    const filterComponent = new Filter(itFilterData);

    filterComponent.onFilter = (evt) => {
      const filterCaption = evt.target.htmlFor;
      filteredPoints(filterCaption);
    };

    const filterElement = filterComponent.render();
    filtersForm.appendChild(filterElement);
  }
};

const sortByDuration = (daysPoints) => {
  for (const dayPoints of daysPoints.values()) {
    dayPoints.sort((first, second) => {
      const firstDuration = (first.schedule.endTime - first.schedule.startTime);
      const secondDuration = (second.schedule.endTime - second.schedule.startTime);
      return secondDuration - firstDuration;
    });
  }
};

const sortByPrice = (daysPoints) => {
  for (const dayPoints of daysPoints.values()) {
    dayPoints.sort((first, second) => second.fullCost - first.fullCost);
  }
};

const sortPoints = (points, caption) => {
  const actualPoints = getFilteredPoints(tripPoints, activeFilterCaption);
  switch (caption) {
    case `sorting-event`:
      activeSortingCaption = `sorting-event`;
      createDaysPointsData(actualPoints);
      break;
    case `sorting-time`:
      activeSortingCaption = `sorting-time`;
      sortByDuration(points);
      break;
    case `sorting-price`:
      activeSortingCaption = `sorting-price`;
      sortByPrice(points);
      break;
  }
  renderDays();
};

const renderSortings = (allSortingData, allDaysPoints) => {
  const temporaryItem = sortingForm.removeChild(sortingOffersItem);
  sortingForm.innerHTML = ``;

  for (const itSortingData of allSortingData) {
    const sortingComponent = new Sorting(itSortingData);

    sortingComponent.onSorting = (evt) => {
      const sortingCaption = evt.target.htmlFor;
      sortPoints(allDaysPoints, sortingCaption);
    };

    const filterElement = sortingComponent.render();
    sortingForm.appendChild(filterElement);
    sortingForm.appendChild(temporaryItem);
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
  renderFilters(getControlItems(FILTER_CAPTIONS), tripPoints);
  renderSortings(getControlItems(SORTING_CAPTIONS), daysPointsData);
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
