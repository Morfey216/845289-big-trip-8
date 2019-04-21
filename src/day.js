import Component from './component.js';

export default class TotalCost extends Component {
  constructor(number, date) {
    super();
    this._number = number;
    this._date = date;
  }

  get template() {
    return `<section class="trip-day">
      <article class="trip-day__info">
        <span class="trip-day__caption">Day</span>
        <p class="trip-day__number">${this._number}</p>
        <h2 class="trip-day__title">${this._date}</h2>
      </article>
      <div class="trip-day__items">
      </div>
    </section>`.trim();
  }
}
