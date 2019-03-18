import createElement from './create-element.js';

export default class Point {
  constructor(data) {
    this._type = data.type;
    this._place = data.place;
    this._schedule = data.schedule;
    this._price = data.price;
    this._offers = data.offers;
    this._description = data.description;

    this._element = null;
    this._state = {
      isEdit: false
    };
  }

  get template() {
    return `
    <article class="trip-point">
      <i class="trip-icon">${this._type.icon}</i>
      <h3 class="trip-point__title">${this._type.title} to ${this._place}</h3>
      <p class="trip-point__schedule">
        <span class="trip-point__timetable">${this._schedule.startTime}&nbsp;&mdash; ${this._schedule.endTime}</span>
        <span class="trip-point__duration">${this._schedule.duration}</span>
      </p>
      <p class="trip-point__price">&euro;&nbsp;${this._price}</p>
      <ul class="trip-point__offers">
        ${this._offers.map((offer) => (
    `<li>
            <button class="trip-point__offer">${offer.name} +&euro;&nbsp;${offer.price}</button>
        </li>`
  )).join(``)}
      </ul>
    </article>`.trim();
  }

  render(container) {
    if (this._element) {
      container.removeChild(this._element);
      this._element = null;
    }

    this._element = createElement(this.template);
    container.appendChild(this._element);
  }
}