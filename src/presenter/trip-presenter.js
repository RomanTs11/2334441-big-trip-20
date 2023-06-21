import { remove, render, RenderPosition } from '../framework/render';
import TripListView from '../view/trip-list-view';
import SortView from '../view/sort-view';
import TripListEmptyView from '../view/trip-list-empty-view';
import EventPresenter from './event-presenter';
import { FilterType, SortType, UpdateType, UserAction } from '../const';
import { sortByDay, sortByPrice, sortByTime } from '../utils/events';
import { filter } from '../utils/filter';
import NewEventPresenter from './new-event-presenter';
import LoadingView from '../view/loading-view';
import UiBlocker from '../framework/ui-blocker/ui-blocker';
import InfoPresenter from './info-presenter';

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

export default class TripPresenter {
  #tripContainer = null;
  #infoContainer = null;
  #eventsModel = null;
  #filterModel = null;

  #tripListComponent = new TripListView();
  #loadingComponent = new LoadingView();
  #sortComponent = null;
  #tripEmptyComponent = null;

  #eventPresenters = new Map();
  #newEventPresenter = null;
  #infoPresenter = null;
  #currentSortType = SortType.DAY;
  #filterType = FilterType.EVERYTHING;
  #isLoading = true;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  constructor({tripContainer, eventsModel, filterModel, onNewEventDestroy, infoContainer}) {
    this.#tripContainer = tripContainer;
    this.#infoContainer = infoContainer;
    this.#eventsModel = eventsModel;
    this.#filterModel = filterModel;

    this.#newEventPresenter = new NewEventPresenter({
      eventListContainer: this.#tripListComponent.element,
      onDataChange: this.#handleViewAction,
      onDestroy: onNewEventDestroy,
      destinations: this.destinations,
      offers: this.offers,
      onModeChange: this.#handleModeChange
    });

    this.#eventsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get events() {
    this.#filterType = this.#filterModel.filter;
    const events = this.#eventsModel.events;
    const filteredEvents = filter[this.#filterType](events);

    switch (this.#currentSortType) {
      case SortType.DAY:
        return filteredEvents.sort(sortByDay);
      case SortType.TIME:
        return filteredEvents.sort(sortByTime);
      case SortType.PRICE:
        return filteredEvents.sort(sortByPrice);
    }
    return filteredEvents;
  }

  get destinations() {
    return this.#eventsModel.destinations;
  }

  get offers() {
    return this.#eventsModel.offers;
  }

  init() {
    this.#renderTrip();
  }

  createEvent() {
    this.#currentSortType = SortType.DAY;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#newEventPresenter.init();
  }

  #handleModeChange = () => {
    this.#newEventPresenter.destroy();
    this.#eventPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();

    switch (actionType) {
      case UserAction.UPDATE_EVENT:
        this.#eventPresenters.get(update.id).setSaving();
        try {
          await this.#eventsModel.updateEvent(updateType, update);
        } catch (err) {
          this.#eventPresenters.get(update.id).setAborting();
        }
        break;
      case UserAction.ADD_EVENT:
        this.#newEventPresenter.setSaving();
        try {
          await this.#eventsModel.addEvent(updateType, update);
        } catch (err) {
          this.#newEventPresenter.setAborting();
        }
        break;
      case UserAction.DELETE_EVENT:
        this.#eventPresenters.get(update.id).setDeleting();
        try {
          await this.#eventsModel.deleteEvent(updateType, update);
        } catch (err) {
          this.#eventPresenters.get(update.id).setAborting();
        }
        break;
    }

    this.#uiBlocker.unblock();
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#eventPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clearTrip();
        this.#renderTrip();
        break;
      case UpdateType.MAJOR:
        this.#clearTrip({resetSortType: true});
        this.#renderTrip();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#renderTrip();
        break;
    }
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearTrip();
    this.#renderTrip();
  };

  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });
    render(this.#sortComponent, this.#tripListComponent.element, RenderPosition.AFTERBEGIN);
  }

  #renderEvent({eventTrip, destinations, offers}) {
    const eventPresenter = new EventPresenter({
      eventListContainer: this.#tripListComponent.element,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
      destinations, offers
    });

    eventPresenter.init(eventTrip);
    this.#eventPresenters.set(eventTrip.id, eventPresenter);
  }

  #renderEvents(events, destinations, offers) {
    events.forEach((event) => this.#renderEvent({
      eventTrip: event,
      destinations: destinations,
      offers: offers
    }));
  }

  #renderInfo() {
    const events = this.#eventsModel.events.sort(sortByDay);
    const destinations = this.destinations;
    const offers = this.offers;
    this.#infoPresenter = new InfoPresenter({
      infoContainer: this.#infoContainer,
      events: events,
      destinations: destinations,
      offers: offers,
    });
    this.#infoPresenter.init();
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#tripContainer, RenderPosition.AFTERBEGIN);
  }

  #renderTripEmpty() {
    this.#tripEmptyComponent = new TripListEmptyView({
      filterType: this.#filterType,
    });
    render(this.#tripEmptyComponent, this.#tripContainer);
  }

  #renderTripList() {
    const events = this.events;
    const destinations = this.destinations;
    const offers = this.offers;

    render(this.#tripListComponent, this.#tripContainer);
    this.#renderEvents(events, destinations, offers);
  }

  #clearTrip({resetSortType = false} = {}) {
    this.#newEventPresenter.destroy();
    this.#eventPresenters.forEach((presenter) => presenter.destroy());
    this.#eventPresenters.clear();
    this.#infoPresenter.destroy();

    remove(this.#sortComponent);
    remove(this.#loadingComponent);

    if (this.#tripEmptyComponent) {
      remove(this.#tripEmptyComponent);
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }
  }

  #renderTrip() {
    render(this.#tripListComponent, this.#tripContainer);

    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    if (this.events.length === 0) {
      this.#renderTripEmpty();
      return;
    }

    this.#renderSort();
    this.#renderInfo();
    this.#renderTripList();
  }
}
