export default class ModelPoint {
  constructor(data) {
    this.id = data[`id`] || ``;
    this.typeTitle = data[`type`] || ``;
    this.offers = data[`offers`] || [];
    this.schedule = {
      startTime: new Date(data[`date_from`]),
      endTime: new Date(data[`date_to`])
    };
    this.price = data[`base_price`] || 0;
    this.place = data[`destination`][`name`] || ``;
    this.description = data[`destination`][`description`] || ``;
    this.pictures = data[`destination`][`pictures`] || [];
    this.isFavorite = data[`is_favorite`] || false;
  }

  toRAW() {
    return {
      'id': this.id,
      'type': this.typeTitle,
      'offers': this.offers,
      'date_from': this.schedule.startTime,
      'date_to': this.schedule.endTime,
      'base_price': this.price,
      'destination': {
        'name': this.place,
        'description': this.description,
        'pictures': this.pictures
      },
      'is_favorite': this.isFavorite
    };
  }

  static parsePoint(data) {
    return new ModelPoint(data);
  }

  static parsePoints(data) {
    return data.map(ModelPoint.parsePoint);
  }
}
