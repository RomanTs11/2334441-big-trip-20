import AbstractView from '../framework/view/abstract-view';

function createTripInfoTemplate(events, destinations, offers) {
  const sumEvents = events.map((element) => element.basePrice).reduce((a, b) => a + b);

  const allOffers = [];
  events.forEach((event) => {
    const currentOffers = offers.find((element) => element.type === event.type).offers;
    const selectedOffers = event.offers.map((offerId) => currentOffers.find((element) => element.id === offerId));
    allOffers.push(...selectedOffers);
  });
  const sumOffers = allOffers.map((element) => element.price).reduce((a,b) => a + b);

  const sumEventsTotal = sumEvents + sumOffers;

  return (
    `<section class="trip-main__trip-info  trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">Amsterdam &mdash; Chamonix &mdash; Geneva</h1>
        <p class="trip-info__dates">Mar 18&nbsp;&mdash;&nbsp;20</p>
      </div>
      <p class="trip-info__cost">
      Total: &euro;&nbsp;<span class="trip-info__cost-value">${sumEventsTotal}</span>
      </p>
    </section>`
  );
}

export default class TripInfoView extends AbstractView {
  #events = null;
  #destinations = null;
  #offers = null;

  constructor({events, destinations, offers}) {
    super();
    this.#events = events;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  get template() {
    return createTripInfoTemplate(this.#events, this.#destinations, this.#offers);
  }
}
