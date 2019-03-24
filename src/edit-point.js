import moment from 'moment';
import flatpickr from 'flatpickr';
import PointComponent from './point-component.js';
import isEscEvent from './util.js';

export default class EditPoint extends PointComponent {
  constructor(data) {
    super();
    this._type = data.type;
    this._place = data.place;
    this._schedule = data.schedule;
    this._price = data.price;
    this._offers = data.offers;
    this._description = data.description;
    this._pictures = data.pictures;
    this._types = data.types;
    this._destinations = data.destinations;

    this._state.isFavorite = false;

    this._onSave = null;
    this._onReset = null;
    this._onDelete = null;

    this._onSaveButtonClick = this._onSaveButtonClick.bind(this);
    this._onDeleteButtonClick = this._onDeleteButtonClick.bind(this);
    this._onEscKeydown = this._onEscKeydown.bind(this);
    this._onChangeDate = this._onChangeDate.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);
    this._onChangeFavorit = this._onChangeFavorit.bind(this);
    this._onSelectWay = this._onSelectWay.bind(this);
  }

  _processForm(formData) {
    const entry = {
      type: {
        title: ``,
        icon: `️`,
        group: ``
      },
      // place: ``,
      // schedule: {
      //   startTime: new Date(),
      //   endTime: new Date()
      // },
      price: ``,
      offers: []
    };

    const pointEditMapper = EditPoint.createMapper(entry);
    const currentOffers = this._offers;
    const types = this._types;

    for (const pair of formData.entries()) {
      const [property, value] = pair;

      if (pointEditMapper[property]) {
        pointEditMapper[property](value);
      }
    }

    const determineIfOfferIsSelected = (offer) => entry.offers.some((it) => it === offer);

    const createNewOffers = () => {
      const newOffers = [];
      for (const currentOffer of currentOffers) {
        const selectedOffer = determineIfOfferIsSelected(currentOffer.name);

        if (selectedOffer) {
          currentOffer.active = true;
        } else {
          currentOffer.active = false;
        }
        newOffers.push(currentOffer);
      }
      return newOffers;
    };

    const createNewType = () => {
      const index = types.findIndex((it) => it.title === entry.type.title);
      return types[index];
    };

    entry.offers = createNewOffers();
    entry.type = createNewType();
    return entry;
  }

  _onSaveButtonClick(evt) {
    evt.preventDefault();

    const formData = new FormData(this._element.querySelector(`form`));
    const newData = this._processForm(formData);

    if (typeof this._onSave === `function`) {
      this._onSave(newData);
    }

    this.update(newData);
  }

  _onDeleteButtonClick() {
    if (typeof this._onDelete === `function`) {
      this._onDelete();
    }
  }

  _onEscKeydown(evt) {
    if (typeof this._onReset === `function`) {
      isEscEvent(evt, this._onReset);
    }
  }

  _onChangeFavorit() {
    this._state.isFavorite = !this._state.isFavorite;
  }

  _onSelectWay(evt) {
    this._type = this._getCurrentWay(evt.target.value);
    this._element.querySelector(`.point__destination-label`).textContent = `${this._type.title} to`;
    this._element.querySelector(`.travel-way__label`).textContent = this._type.icon;
    this._element.querySelector(`.travel-way__toggle`).checked = false;
  }

  _getCurrentWay(title) {
    const types = this._types;
    const index = types.findIndex((it) => it.title === title);
    return types[index];
  }

  _onChangeDate() {}

  _onChangeTime() {
    // this._schedule.duration = this._getDuration();
    // console.log(this._schedule.duration);
  }

  _getDuration() {
    return moment.duration(moment(this._schedule.endTime).diff(moment(this._schedule.startTime)));
  }

  _partialUpdate() {
    // this._element.innerHTML = ``;
    // const newElement = this.template;
  }

  set onSave(fn) {
    this._onSave = fn;
  }

  set onReset(fn) {
    this._onReset = fn;
  }

  set onDelete(fn) {
    this._onDelete = fn;
  }

  get template() {
    const offerNameToValue = {
      'Add luggage': `add-luggage`,
      'Switch to comfort class': `switch-to-comfort-class`,
      'Add meal': `add-meal`,
      'Choose seats': `choose-seats`
    };

    return `
    <article class="point">
  <form action="" method="get">
    <header class="point__header">
      <label class="point__date">
        choose day
        <input class="point__input" type="text" placeholder="MAR 18" name="day">
      </label>

      <div class="travel-way">
        <label class="travel-way__label" for="travel-way__toggle">${this._type.icon}</label>

        <input type="checkbox" class="travel-way__toggle visually-hidden" id="travel-way__toggle">

        <div class="travel-way__select">
          <div class="travel-way__select-group">
            ${this._types.filter((it) => it.group === `transport`).map((way) => (
    `<input class="travel-way__select-input visually-hidden" type="radio" id="travel-way-${way.title.toLowerCase()}" name="travel-way" value=${way.title.toLowerCase()} ${this._type.title === way.title ? `checked` : ``}>
            <label class="travel-way__select-label" for="travel-way-${way.title.toLowerCase()}">${way.icon} ${way.title.toLowerCase()}</label>`
  )).join(``)}          
          </div>

          <div class="travel-way__select-group">
            ${this._types.filter((it) => it.group === `service`).map((way) => (
    `<input class="travel-way__select-input visually-hidden" type="radio" id="travel-way-${way.title.toLowerCase()}" name="travel-way" value=${way.title.toLowerCase()} ${this._type.title === way.title ? `checked` : ``}>
            <label class="travel-way__select-label" for="travel-way-${way.title.toLowerCase()}">${way.icon} ${way.title.toLowerCase()}</label>`
  )).join(``)}
          </div>
        </div>
      </div>

      <div class="point__destination-wrap">
        <label class="point__destination-label" for="destination">${this._type.title} to</label>
        <input class="point__destination-input" list="destination-select" id="destination" value="${this._place}" name="destination">
        <datalist id="destination-select">
          ${this._destinations.map((destination) => (
    `<option value=${destination}></option>`)).join(``)}
        </datalist>
      </div>

      <label class="point__time">
        choose time
        <input class="point__input" type="text" value="${moment(this._schedule.startTime).format(`HH:mm`)}&nbsp;&mdash; ${moment(this._schedule.endTime).format(`HH:mm`)}" name="time" placeholder="00:00 — 00:00">
      </label>

      <label class="point__price">
        write price
        <span class="point__price-currency">€</span>
        <input class="point__input" type="text" value="${this._price}" name="price">
      </label>

      <div class="point__buttons">
        <button class="point__button point__button--save" type="submit">Save</button>
        <button class="point__button" type="reset">Delete</button>
      </div>

      <div class="paint__favorite-wrap">
        <input type="checkbox" class="point__favorite-input visually-hidden" id="favorite" name="favorite" ${this._state.isFavorite ? `checked` : ``}>
        <label class="point__favorite" for="favorite">favorite</label>
      </div>
    </header>

    <section class="point__details">
      <section class="point__offers">
        <h3 class="point__details-title">offers</h3>

        <div class="point__offers-wrap">
          ${this._offers.map((offer) => (
    `<input class="point__offers-input visually-hidden" type="checkbox" id=${offerNameToValue[offer.name]} name="offer" value=${offerNameToValue[offer.name]} ${offer.active ? `checked` : ``}>
            <label for=${offerNameToValue[offer.name]} class="point__offers-label">
            <span class="point__offer-service">${offer.name}</span> + €<span class="point__offer-price">${offer.price}</span>
          </label>`
  )).join(``)}
        </div>

      </section>
      <section class="point__destination">
        <h3 class="point__details-title">Destination</h3>
        <p class="point__destination-text">${this._description}</p>
        <div class="point__destination-images">
          ${this._pictures.map((picture) => `<img src=${picture} alt="picture from place" class="point__destination-image"></img>`).join(``)}
        </div>
      </section>
      <input type="hidden" class="point__total-price" name="total-price" value="">
    </section>
  </form>
</article>`.trim();
  }

  bind() {
    this._element.querySelector(`.point__button--save`).addEventListener(`click`, this._onSaveButtonClick);
    this._element.querySelectorAll(`.point__button`)[1].addEventListener(`click`, this._onDeleteButtonClick);
    document.addEventListener(`keydown`, this._onEscKeydown);
    this._element.querySelector(`.point__favorite-input`).addEventListener(`click`, this._onChangeFavorit);
    this._element.querySelector(`.travel-way__select`).addEventListener(`change`, this._onSelectWay);
    // this._element.querySelector(`.point__time input`).addEventListener(`click`, this._onChangeTime);
    const timeInput = this._element.querySelector(`.point__time input`);
    const time = this._schedule;

    flatpickr(
        timeInput,
        {
          mode: `range`,
          enableTime: true,
          noCalendar: true,
          // altInput: true,
          // altFormat: `H:i`,
          dateFormat: `H:i`,
          defaultDate: [time.startTime, time.endTime],
          onClose: (selectedDates) => {
            this._schedule.startTime = selectedDates[0];
            this._schedule.endTime = selectedDates[1];
            // this._schedule.duration = moment.duration(selectedDates[1] - selectedDates[0]);
            this._schedule.duration = moment.duration(moment(this._schedule.endTime).diff(moment(this._schedule.startTime))).format(`HH:mm`);
          },
          [`time_24hr`]: true
        }
    );
  }

  unbind() {
    this._element.querySelector(`.point__button--save`).removeEventListener(`click`, this._onSaveButtonClick);
    this._element.querySelectorAll(`.point__button`)[1].removeEventListener(`click`, this._onDeleteButtonClick);
    document.removeEventListener(`keydown`, this._onEscKeydown);
    this._element.querySelector(`.point__favorite-input`).removeEventListener(`click`, this._onChangeFavorit);
    this._element.querySelector(`.travel-way__select`).removeEventListener(`change`, this._onSelectWay);
    this._element.querySelector(`.point__time input`).removeEventListener(`click`, this._onChangeTime);
  }

  update(data) {
    this._type = data.type;
    // this._place = data.place;
    // this._schedule = data.schedule;
    this._price = data.price;
    this._offers = data.offers;
    // this._description = data.description;
  }

  static createMapper(target) {
    const offerValueToName = {
      'add-luggage': `Add luggage`,
      'switch-to-comfort-class': `Switch to comfort class`,
      'add-meal': `Add meal`,
      'choose-seats': `Choose seats`
    };

    return {
      'travel-way': (value) => (target.type.title = value),
      'offer': (value) => target.offers.push(offerValueToName[value]),
      'price': (value) => (target.price = value),
      // time: (value) => (target.schedule = value),
    };
  }
}
