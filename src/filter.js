import Component from './component.js';

export default class Filter extends Component {
  constructor(data) {
    super();
    this._caption = data.caption;
    this._checked = data.checked;
  }

  get template() {
    return `
    <input type="radio" 
    id="filter-${this._caption.toLowerCase()}" 
    name="filter" 
    value="${this._caption.toLowerCase()}" 
    ${this._checked ? `checked` : ``}>
    <label class="trip-filter__item" 
    for="filter-${this._caption.toLowerCase()}">
    ${this._caption}
    </label>`;
  }

  render() {
    this._element = this.template;
    return this._element;
  }
}
