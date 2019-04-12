export default class ModelPoint {
  constructor(data) {
    this.id = data[`id`];
    this.typeTitle = data[`type`];
    this.offers = data[`offers`];
    this.schedule = {
      startTime: data[`date_from`],
      endTime: data[`date_to`]
    };
    this.price = data[`base_price`];
    this.place = data[`destination`][`name`];
    this.description = data[`destination`][`description`];
    this.pictures = data[`destination`][`pictures`];
    this.isFavorite = data[`is_favorite`];
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
