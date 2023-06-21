import TripInfoView from '../view/trip-info-view';
import { remove, render, RenderPosition } from '../framework/render';

export default class InfoPresenter {
  #infoContainer = null;
  #events = null;
  #destinations = null;
  #offers = null;

  #infoComponent = null;

  constructor({infoContainer, events, destinations, offers}) {
    this.#infoContainer = infoContainer;
    this.#events = events;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  init() {
    this.#infoComponent = new TripInfoView({
      events: this.#events,
      destinations: this.#destinations,
      offers: this.#offers
    });

    render(this.#infoComponent, this.#infoContainer, RenderPosition.AFTERBEGIN);
  }

  destroy() {
    if (this.#infoComponent === null) {
      return;
    }

    remove(this.#infoComponent);
    this.#infoComponent = null;
  }
}
