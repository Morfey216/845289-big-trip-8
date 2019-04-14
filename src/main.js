import API from './api.js';
import Provider from './provider.js';
import Store from './store.js';
import {TYPES} from './get-point-data.js';
import filtersData from './filters-data.js';
import Point from './point.js';
import EditPoint from './edit-point.js';
import Filter from './filter.js';
import Statistic from './statistic.js';

const AUTHORIZATION = `Basic eo0w590ik37599a`;
const END_POINT = `https://es8-demo-srv.appspot.com/big-trip`;
const POINTS_STORE_KEY = `points-store-key`;

const api = new API({endPoint: END_POINT, authorization: AUTHORIZATION});
const store = new Store({key: POINTS_STORE_KEY, storage: localStorage});
const provider = new Provider({api, store, generateId: () => String(Date.now())});

const mainSection = document.querySelector(`.main`);
const tableButton = document.querySelector(`.view-switch__item[href="#table"]`);
const statisticButton = document.querySelector(`.view-switch__item[href="#stats"]`);
const filtersForm = document.querySelector(`.trip-filter`);
const tripDayItemsBlock = document.querySelector(`.trip-day__items`);

let destinationsKit = [];
let offersKit = [];
let offersNameKit = [];
let offersLabelKit = [];
let tripPoints = [];
let statistic = null;

window.addEventListener(`offline`, () => {
  document.title = `${document.title}[OFFLINE]`;
});

window.addEventListener(`online`, () => {
  document.title = document.title.split(`[OFFLINE]`)[0];
  provider.syncPoints();
});

const updatePointData = (points, pointToUpdate, newPoint) => {
  const index = points.findIndex((it) => it === pointToUpdate);
  Object.assign(points[index], pointToUpdate, newPoint);
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
          pointComponent.update(newPoint);
          pointComponent.render();
          dist.replaceChild(pointComponent.element, editPointComponent.element);
          editPointComponent.unrender();
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
          deletePointData(allPointsData, itPointData);
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

const getDestinationsKit = (kit) => {
  destinationsKit = kit;
};

const getOffersKit = (kit) => {
  offersKit = kit;
  offersNameKit = createOffersNameKit(offersKit);
  offersLabelKit = createOffersLabelKit(offersNameKit);
};

const createFullPointData = (point) => {
  point.destinations = destinationsKit;
  point.types = offersKit;
  point.type = createType(point);
  point.offersNameKit = offersNameKit;
  point.offersLabelKit = offersLabelKit;
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
  // console.log(tripPoints);
  renderTripPoints(tripDayItemsBlock, tripPoints);
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
    })
    .catch(() => {
      tripDayItemsBlock.textContent = loadErrorText;
    });
  })
  .catch(() => {
    tripDayItemsBlock.textContent = loadErrorText;
  });
};

loadData();
