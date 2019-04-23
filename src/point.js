import moment from 'moment';
import Component from './component.js';

const MAX_ACCEPTRD_OFFERS = 3;

const setFormat = (num) => {
  return String(num).padStart(2, `0`);
};

export default class Point extends Component {
  constructor(data) {
    super();
    this._type = data.type;
    this._place = data.place;
    this._schedule = data.schedule;
    this._price = data.price;
    this._offers = data.offers;
    this._description = data.description;
    this._pictures = data.pictures;

    this._onEdit = null;
    this._onPointClick = this._onPointClick.bind(this);
  }

  _onPointClick(evt) {
    evt.preventDefault();
    if (typeof this._onEdit === `function`) {
      this._onEdit();
    }
  }

  _getDurationTemplate(duration) {
    if (!(duration.days || duration.hours)) {
      return `${setFormat(duration.minutes)}M`;
    } else if (!duration.days) {
      return `${setFormat(duration.hours)}H ${setFormat(duration.minutes)}M`;
    }
    return `${setFormat(duration.days)}D ${setFormat(duration.hours)}H ${setFormat(duration.minutes)}M`;
  }

  _getDuration() {
    const duration = moment.duration(moment(this._schedule.endTime).diff(moment(this._schedule.startTime)));
    return {
      days: duration.days(),
      hours: duration.hours(),
      minutes: duration.minutes()
    };
  }

  _getOffers() {
    const offers = this._offers.filter((it) => it.accepted);
    if (offers.length > MAX_ACCEPTRD_OFFERS) {
      offers.length = MAX_ACCEPTRD_OFFERS;
    }
    return offers;
  }

  set onEdit(fn) {
    this._onEdit = fn;
  }

  get template() {
    return `
    <article class="trip-point">
      <i class="trip-icon">${this._type.icon}</i>
      <h3 class="trip-point__title">${this._type.title} to ${this._place}</h3>
      <p class="trip-point__schedule">
        <span class="trip-point__timetable">${moment(this._schedule.startTime).format(`HH:mm`)}&nbsp;&mdash; ${moment(this._schedule.endTime).format(`HH:mm`)}</span>
        <span class="trip-point__duration">${(this._getDurationTemplate(this._getDuration()))}</span>
      </p>
      <p class="trip-point__price">&euro;&nbsp;${this._price}</p>
      <ul class="trip-point__offers">
        ${this._getOffers().map((offer) => (`
        <li>
          <button class="trip-point__offer">${offer.title} +&euro;&nbsp;${offer.price}</button>
        </li>`)).join(``)}
      </ul>
    </article>`.trim();
  }

  bind() {
    this._element.addEventListener(`click`, this._onPointClick);
  }

  unbind() {
    this._element.removeEventListener(`click`, this._onPointClick);
  }

  update(data) {
    this._type = data.type;
    this._place = data.place;
    this._schedule = data.schedule;
    this._price = data.price;
    this._offers = data.offers;
    this._description = data.description;
    this._pictures = data.pictures;
  }
}
