import Component from './component.js';

export default class TotalCost extends Component {
  constructor(cost) {
    super();
    this._cost = cost;
  }

  get template() {
    return `<span class="trip__total-cost">&euro;&nbsp;${this._cost}</span>`.trim();
  }

  update(cost) {
    this._cost = cost;
  }
}
