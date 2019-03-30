import Component from './component.js';

export default class Filter extends Component {
  constructor(data) {
    super();
    this._caption = data.caption;
    this._checked = data.checked;

    this._onFilter = null;
    this._onFilterClick = this._onFilterClick.bind(this);
  }

  _onFilterClick(evt) {
    evt.preventDefault();

    if (typeof this._onFilter === `function`) {
      this._onFilter(evt);
    }

    this._element.querySelector(`input`).checked = `checked`;
    this._checked = true;
  }

  set onFilter(fn) {
    this._onFilter = fn;
  }

  get template() {
    return `
    <span>
    <input type="radio" 
    id="filter-${this._caption.toLowerCase()}" 
    name="filter" 
    value="${this._caption.toLowerCase()}" 
    ${this._checked ? `checked` : ``}>
    <label class="trip-filter__item" 
    for="filter-${this._caption.toLowerCase()}">
    ${this._caption}
    </label>
    </span>`.trim();
  }

  bind() {
    this._element.addEventListener(`click`, this._onFilterClick, false);
  }

  unbind() {
    this._element.removeEventListener(`click`, this._onFilterClick);
  }
}
