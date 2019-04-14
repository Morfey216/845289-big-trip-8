import ModelPoint from './model-point.js';

const objectToArray = (object) => {
  return Object.keys(object).map((id) => object[id]);
};

export default class Provider {
  constructor({api, store, generateId}) {
    this._api = api;
    this._store = store;
    this._generateId = generateId;
    this._needSync = false;
  }

  _isOnline() {
    return window.navigator.onLine;
  }

  updatePoint({id, data}) {
    if (this._isOnline()) {
      return this._api.updatePoint({id, data})
        .then((point) => {
          this._store.setItem({key: point.id, item: point.toRAW()});
          return point;
        });
    } else {
      const point = data;
      this._needSync = true;
      this._store.setItem({key: point.id, item: point});
      return Promise.resolve(ModelPoint.parsePoint(point));
    }
  }

  createPoint({newPoint}) {
    if (this._isOnline()) {
      return this._api.createPoint({newPoint})
        .then((point) => {
          this._store.setItem({key: point.id, item: point.toRAW()});
          return point;
        });
    } else {
      newPoint.id = this._generateId();
      this._needSync = true;

      this._store.setItem({key: newPoint.id, item: newPoint});
      return Promise.resolve(ModelPoint.parsePoint(newPoint));
    }
  }

  deletePoint({id}) {
    if (this._isOnline()) {
      return this._api.deletePoint({id})
        .then(() => {
          this._store.removeItem({key: id});
        });
    } else {
      this._needSync = true;
      this._store.removeItem({key: id});
      return Promise.resolve(true);
    }
  }

  getPoints() {
    if (this._isOnline()) {
      return this._api.getPoints()
        .then((points) => {
          points.map((it) => this._store.setItem({key: it.id, item: it.toRAW()}));
          return points;
        });
    } else {
      const rawPointsMap = this._store.getAll();
      const rawPoints = objectToArray(rawPointsMap);
      const points = ModelPoint.parsePoints(rawPoints);

      return Promise.resolve(points);
    }
  }

  syncPoints() {
    return this._api.syncPoints({points: objectToArray(this._store.getAll())});
  }

  getDestinations() {
    return this._api.getDestinations();
  }

  getOffers() {
    return this._api.getOffers();
  }
}
