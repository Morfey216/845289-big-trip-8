import Component from './component.js';

export default class Sorting extends Component {
  constructor(data) {
    super();
    this._caption = data.caption;
    this._checked = data.checked;

    this._onSorting = null;
    this._onSortingClick = this._onSortingClick.bind(this);
  }

  _onSortingClick(evt) {
    evt.preventDefault();

    if (typeof this._onSorting === `function`) {
      this._onSorting(evt);
    }

    this._element.querySelector(`input`).checked = `checked`;
    this._checked = true;
  }

  set onSorting(fn) {
    this._onSorting = fn;
  }

  get template() {
    return `
    <span>
    <input type="radio" 
    name="trip-sorting" 
    id="sorting-${this._caption.toLowerCase()}" 
    value="${this._caption.toLowerCase()}" ${this._checked ? `checked` : ``}>
    <label class="trip-sorting__item trip-sorting__item--${this._caption.toLowerCase()}" 
    for="sorting-${this._caption.toLowerCase()}">
    ${this._caption}
    </label>
    </span>`.trim();
  }

  bind() {
    this._element.addEventListener(`click`, this._onSortingClick, false);
  }

  unbind() {
    this._element.removeEventListener(`click`, this._onSortingClick);
  }
}
