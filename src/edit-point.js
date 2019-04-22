import moment from 'moment';
import flatpickr from 'flatpickr';
import Component from './component.js';
import isEscEvent from './util.js';

export default class EditPoint extends Component {
  constructor(data) {
    super();
    this._id = data.id;
    this._typeTitle = data.typeTitle;
    this._type = data.type;
    this._type.offers = data.offers;
    this._place = data.place;
    this._schedule = data.schedule;
    this._price = data.price;
    this._offers = data.offers;
    this._description = data.description;
    this._pictures = data.pictures;
    this._types = data.types;
    this._destinations = data.destinations;
    this._offersNameKit = data.offersNameKit;
    this._offersLabelKit = data.offersLabelKit;
    this._isFavorite = data.isFavorite;

    this._state.typeIsChanged = false;
    this._state.destinationIsChanged = false;

    this._onSave = null;
    this._onReset = null;
    this._onDelete = null;
    this._newSchedule = {
      startTime: this._schedule.startTime,
      endTime: this._schedule.endTime
    };

    this._onSaveButtonClick = this._onSaveButtonClick.bind(this);
    this._onDeleteButtonClick = this._onDeleteButtonClick.bind(this);
    this._onEscKeydown = this._onEscKeydown.bind(this);
    this._onSelectWay = this._onSelectWay.bind(this);
    this._onSelectDestination = this._onSelectDestination.bind(this);
  }

  _processForm(formData) {
    const entry = {
      type: {
        title: ``,
        icon: `️`,
        group: ``
      },
      typeTitle: ``,
      place: ``,
      description: ``,
      pictures: [],
      schedule: {
        startTime: ``,
        endTime: ``
      },
      price: ``,
      offers: []
    };

    const pointEditMapper = EditPoint.createMapper(entry);
    let currentDestination = {
      description: this._description,
      pictures: this._pictures,
    };

    for (const pair of formData.entries()) {
      const [property, value] = pair;

      if (pointEditMapper[property]) {
        pointEditMapper[property](value);
      }
    }

    const createNewOffers = (type) => {
      let currentOffers = this._offers;
      const newOffers = [];
      const newAcceptedOffersName = [];

      entry.offers.forEach((it) => {
        newAcceptedOffersName.push(this._getOfferName(it));
      });

      const determineIfOfferIsSelected = (offer) => newAcceptedOffersName.some((it) => it === offer);

      if (this._state.typeIsChanged) {
        currentOffers = type.offers;
      }

      for (const currentOffer of currentOffers) {
        const selectedOffer = determineIfOfferIsSelected(currentOffer.title);

        currentOffer.accepted = !!selectedOffer;
        newOffers.push(currentOffer);
      }

      return newOffers;
    };

    if (this._state.destinationIsChanged) {
      currentDestination = this._getNewDestination(entry.place);
    }

    entry.type = this._getNewType(entry.type.title);
    entry.typeTitle = entry.type.type;
    entry.offers = createNewOffers(entry.type);
    entry.description = currentDestination.description;
    entry.pictures = currentDestination.pictures;
    entry.schedule = this._getNewSchedule();
    entry.isFavorite = !!this._element.querySelector(`.point__favorite-input`).checked;
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
      this._onDelete({id: this._id});
    }
  }

  _onEscKeydown(evt) {
    if (typeof this._onReset === `function`) {
      isEscEvent(evt, this._onReset);
    }
  }

  _onSelectWay(evt) {
    const newType = this._getNewType(evt.target.value);
    const offersData = `${newType.offers
      .map((offer) => (
        `<input class="point__offers-input visually-hidden" type="checkbox" id="${this._getOfferLabel(offer.title)}" name="offer" value="${this._getOfferLabel(offer.title)}" ${offer.accepted ? `checked` : ``}>
        <label for="${this._getOfferLabel(offer.title)}" class="point__offers-label">
        <span class="point__offer-service">${offer.title}</span> + €<span class="point__offer-price">${offer.price}</span>
        </label>`))
      .join(``)}`;

    this._element.querySelector(`.point__destination-label`).textContent = `${newType.title} to`;
    this._element.querySelector(`.travel-way__label`).textContent = newType.icon;
    this._element.querySelector(`.point__offers-wrap`).innerHTML = offersData;
    this._element.querySelector(`.travel-way__toggle`).checked = false;
    this._state.typeIsChanged = true;
  }

  _onSelectDestination(evt) {
    const newDestination = this._getNewDestination(evt.target.value);
    const picturesData = `${newDestination.pictures
      .map((picture) => `<img src=${picture.src} alt="${picture.description}" class="point__destination-image"></img>`)
      .join(``)}`;

    this._element.querySelector(`.point__destination-text`).textContent = `${newDestination.description}`;
    this._element.querySelector(`.point__destination-images`).innerHTML = picturesData;
    this._state.destinationIsChanged = true;
  }

  _getNewDestination(destinationName) {
    const destinations = this._destinations;
    const index = destinations.findIndex((it) => it.name === destinationName);
    return destinations[index];
  }

  _getNewType(title) {
    const types = this._types;
    const index = types.findIndex((it) => it.title.toLowerCase() === title);
    return types[index];
  }

  _getNewSchedule() {
    if (this._newSchedule.startTime !== ``) {
      this._schedule = this._newSchedule;
      this._newSchedule = {
        startTime: ``,
        endTime: ``
      };
    }
    return this._schedule;
  }

  _getOfferLabel(name) {
    const index = this._offersNameKit.findIndex((it) => it === name);
    return this._offersLabelKit[index];
  }

  _getOfferName(label) {
    const index = this._offersLabelKit.findIndex((it) => it === label);
    return this._offersNameKit[index];
  }

  _shake() {
    const ANIMATION_TIMEOUT = 600;
    this._element.style.animation = `shake ${ANIMATION_TIMEOUT / 1000}s`;

    setTimeout(() => {
      this._element.style.animation = ``;
    }, ANIMATION_TIMEOUT);
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
    `<input class="travel-way__select-input visually-hidden" type="radio" id="travel-way-${way.title.toLowerCase()}" name="travel-way" value="${way.title.toLowerCase()}" ${this._type.title === way.title ? `checked` : ``}>
            <label class="travel-way__select-label" for="travel-way-${way.title.toLowerCase()}">${way.icon} ${way.title.toLowerCase()}</label>`
  )).join(``)}          
          </div>

          <div class="travel-way__select-group">
            ${this._types.filter((it) => it.group === `service`).map((way) => (
    `<input class="travel-way__select-input visually-hidden" type="radio" id="travel-way-${way.title.toLowerCase()}" name="travel-way" value="${way.title.toLowerCase()}" ${this._type.title === way.title ? `checked` : ``}>
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
    `<option value="${destination.name}"></option>`)).join(``)}
        </datalist>
      </div>

      <div class="point__time">
        choose time
        <input class="point__input" type="text" value="${moment(this._schedule.startTime).format(`HH:mm`)}" name="date-start" placeholder="19:00">
        <input class="point__input" type="text" value="${moment(this._schedule.endTime).format(`HH:mm`)}" name="date-end" placeholder="21:00">
      </div>

      <label class="point__price">
        write price
        <span class="point__price-currency">€</span>
        <input class="point__input" type="text" value="${this._price}" name="price">
      </label>

      <div class="point__buttons">
        <button class="point__button point__button--save" type="submit">Save</button>
        <button class="point__button point__button--delete" type="reset">Delete</button>
      </div>

      <div class="paint__favorite-wrap">
        <input type="checkbox" class="point__favorite-input visually-hidden" id="favorite" name="favorite" ${this._isFavorite ? `checked` : ``}>
        <label class="point__favorite" for="favorite">favorite</label>
      </div>
    </header>

    <section class="point__details">
      <section class="point__offers">
        <h3 class="point__details-title">offers</h3>

        <div class="point__offers-wrap">
          ${this._offers.map((offer) => (
    `<input class="point__offers-input visually-hidden" type="checkbox" id="${this._getOfferLabel(offer.title)}" name="offer" value="${this._getOfferLabel(offer.title)}" ${offer.accepted ? `checked` : ``}>
            <label for="${this._getOfferLabel(offer.title)}" class="point__offers-label">
            <span class="point__offer-service">${offer.title}</span> + €<span class="point__offer-price">${offer.price}</span>
          </label>`
  )).join(``)}
        </div>

      </section>
      <section class="point__destination">
        <h3 class="point__details-title">Destination</h3>
        <p class="point__destination-text">${this._description}</p>
        <div class="point__destination-images">
          ${this._pictures.map((picture) => `<img src=${picture.src} alt="${picture.description}" class="point__destination-image"></img>`).join(``)}
        </div>
      </section>
      <input type="hidden" class="point__total-price" name="total-price" value="">
    </section>
  </form>
</article>`.trim();
  }

  bind() {
    this._element.querySelector(`.point__button--save`).addEventListener(`click`, this._onSaveButtonClick);
    this._element.querySelector(`.point__button--delete`).addEventListener(`click`, this._onDeleteButtonClick);
    document.addEventListener(`keydown`, this._onEscKeydown);
    this._element.querySelector(`.travel-way__select`).addEventListener(`change`, this._onSelectWay);
    this._element.querySelector(`.point__destination-input`).addEventListener(`change`, this._onSelectDestination);

    const startTimeInput = this._element.querySelector(`.point__time input[name="date-start"]`);
    const endTimeInput = this._element.querySelector(`.point__time input[name="date-end"]`);
    const time = this._schedule;

    flatpickr(
        startTimeInput,
        {
          enableTime: true,
          altInput: true,
          altFormat: `H:i`,
          dateFormat: `H:i`,
          minuteIncrement: 1,
          defaultDate: [time.startTime],
          locale: {
            rangeSeparator: ` - `
          },
          onClose: (selectedDates) => {
            this._newSchedule.startTime = selectedDates[0];
          },
          [`time_24hr`]: true
        }
    );

    flatpickr(
        endTimeInput,
        {
          enableTime: true,
          altInput: true,
          altFormat: `H:i`,
          dateFormat: `H:i`,
          minuteIncrement: 1,
          defaultDate: [time.endTime],
          locale: {
            rangeSeparator: ` - `
          },
          onClose: (selectedDates) => {
            this._newSchedule.endTime = selectedDates[0];
          },
          [`time_24hr`]: true
        }
    );
  }

  unbind() {
    this._element.querySelector(`.point__button--save`).removeEventListener(`click`, this._onSaveButtonClick);
    this._element.querySelector(`.point__button--delete`).removeEventListener(`click`, this._onDeleteButtonClick);
    document.removeEventListener(`keydown`, this._onEscKeydown);
    this._element.querySelector(`.travel-way__select`).removeEventListener(`change`, this._onSelectWay);
    this._element.querySelector(`.point__destination-input`).removeEventListener(`change`, this._onSelectDestination);
  }

  update(data) {
    this._type = data.type;
    this._typeTitle = data.typeTitle;
    this._place = data.place;
    this._description = data.description;
    this._pictures = data.pictures;
    this._schedule = data.schedule;
    this._price = data.price;
    this._offers = data.offers;
    this._isFavorite = data.isFavorite;
    this._state.typeIsChanged = false;
    this._state.destinationIsChanged = false;
  }

  formActivate() {
    const saveButton = this._element.querySelector(`.point__button--save`);
    const deleteButton = this._element.querySelector(`.point__button--delete`);
    const allInputs = this._element.querySelectorAll(`input`);

    return {
      block: () => {
        this._element.style.border = ``;
        saveButton.disabled = true;
        deleteButton.disabled = true;
        allInputs.forEach((input) => {
          input.disabled = true;
        });
      },
      unblock: () => {
        saveButton.disabled = false;
        deleteButton.disabled = false;
        allInputs.forEach((input) => {
          input.disabled = false;
        });
      },
      showError: () => {
        this._element.style.border = `1px solid red`;
        this._shake();
      },
      showSaveButtonText: (text) => {
        saveButton.textContent = text;
      },
      showDeleteButtonText: (text) => {
        deleteButton.textContent = text;
      }
    };
  }

  static createMapper(target) {
    return {
      'travel-way': (value) => (target.type.title = value),
      'destination': (value) => (target.place = value),
      'offer': (value) => target.offers.push(value),
      'price': (value) => (target.price = value),
    };
  }
}
