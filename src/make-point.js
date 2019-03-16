export default (pointData) => `<article class="trip-point">
  <i class="trip-icon">${pointData.type.icon}</i>
  <h3 class="trip-point__title">${pointData.type.title} to ${pointData.place}</h3>
  <p class="trip-point__schedule">
    <span class="trip-point__timetable">${pointData.schedule.startTime}&nbsp;&mdash; ${pointData.schedule.endTime}</span>
    <span class="trip-point__duration">${pointData.schedule.duration}</span>
  </p>
  <p class="trip-point__price">&euro;&nbsp;${pointData.price}</p>
  <ul class="trip-point__offers">
    ${pointData.offers.map((offer) => (
    `<li>
        <button class="trip-point__offer">${offer.name} +&euro;&nbsp;${offer.price}</button>
      </li>`
  )).join(``)}
  </ul>
</article>`;
