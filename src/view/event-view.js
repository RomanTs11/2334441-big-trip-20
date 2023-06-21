import AbstractView from '../framework/view/abstract-view';
import { getRefineEventDateShort, getRefineEventDateTime,
  getRefineTimeDate, getTimeDifference} from '../utils/events';

function createEventOffersTemplate(offers) {
  return offers.map((offer) => `
  <li class="event__offer">
    <span class="event__offer-title">${offer.title}</span>
    &plus;&euro;&nbsp;
    <span class="event__offer-price">${offer.price}</span>
  </li>`).join('');
}

function createEventTemplate(eventTrip, destinations, offers) {
  const {basePrice, dateFrom, dateTo, type, isFavorite} = eventTrip;
  const destination = destinations.find((element) => element.id === eventTrip.destination);
  const isDestination = !destination;
  const isDestinationName = isDestination ? '' : destination.name;

  const currentOffers = offers.find((element) => element.type === type).offers;
  const selectedOffers = eventTrip.offers.map((offerId) => currentOffers.find((element) => element.id === offerId));
  const offersList = createEventOffersTemplate(selectedOffers);

  const date = getRefineEventDateTime(dateFrom);
  const dateShort = getRefineEventDateShort(dateFrom);
  const dateStart = getRefineTimeDate(dateFrom);
  const dateEnd = getRefineTimeDate(dateTo);
  const dateGap = getTimeDifference(dateFrom, dateTo);

  const favoriteClassName = isFavorite
    ? 'event__favorite-btn event__favorite-btn--active'
    : 'event__favorite-btn';

  return (
    `<li class="trip-events__item">
       <div class="event">
         <time class="event__date" datetime="${date}">${dateShort}</time>
         <div class="event__type">
           <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
         </div>
         <h3 class="event__title">${type} ${isDestinationName}</h3>
         <div class="event__schedule">
           <p class="event__time">
             <time class="event__start-time" datetime="${date}">${dateStart}</time>
             &mdash;
             <time class="event__end-time" datetime="${getRefineEventDateTime(dateTo)}">${dateEnd}</time>
           </p>
           <p class="event__duration">${dateGap}</p>
         </div>
         <p class="event__price">
           &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
         </p>
         <h4 class="visually-hidden">Offers:</h4>
         <ul class="event__selected-offers">
            ${offersList}
         </ul>
         <button class="${favoriteClassName}" type="button">
           <span class="visually-hidden">Add to favorite</span>
           <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
             <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
           </svg>
         </button>
         <button class="event__rollup-btn" type="button">
           <span class="visually-hidden">Open event</span>
         </button>
       </div>
    </li>`
  );
}

export default class EventView extends AbstractView {
  #eventTrip = null;
  #destinations = null;
  #offers = null;
  #handleEditClick = null;
  #handleFavoriteClick = null;

  constructor({eventTrip, destinations, offers, onEditClick, onFavoriteClick}) {
    super();
    this.#eventTrip = eventTrip;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleEditClick = onEditClick;
    this.#handleFavoriteClick = onFavoriteClick;

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#editClickHandler);
    this.element.querySelector('.event__favorite-btn')
      .addEventListener('click', this.#favoriteClickHandler);
  }

  get template() {
    return createEventTemplate(this.#eventTrip, this.#destinations, this.#offers);
  }

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleEditClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFavoriteClick();
  };
}
