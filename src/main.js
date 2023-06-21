import TripPresenter from './presenter/trip-presenter';
import FilterPresenter from './presenter/filter-presenter';
import EventsModel from './model/events-model';
import FilterModel from './model/filter-model';
import { render } from './framework/render';
import NewEventButtonView from './view/new-event-button-view';
import EventsApiService from './events-api-services';

const AUTHORIZATION = 'Basic 67h0DqvdVfynG3Jq';
const END_POINT = 'https://20.ecmascript.pages.academy/big-trip';

const siteTripMainElement = document.querySelector('.trip-main');
const tripEventsElement = document.querySelector('.trip-events');
const filtersContainerElement = document.querySelector('.trip-controls__filters');

async function main() {
  const eventsModel = new EventsModel({
    eventsApiService: new EventsApiService(END_POINT, AUTHORIZATION)
  });

  await eventsModel.init();

  const filterModel = new FilterModel();

  const tripPresenter = new TripPresenter({
    tripContainer: tripEventsElement,
    eventsModel,
    filterModel,
    onNewEventDestroy: handleNewEventFormClose,
    infoContainer: siteTripMainElement,
  });

  const filterPresenter = new FilterPresenter({
    filterContainer: filtersContainerElement,
    filterModel,
    eventsModel
  });


  const newEventButtonComponent = new NewEventButtonView({
    onClick: handleNewEventButtonClick
  });

  function handleNewEventFormClose() {
    newEventButtonComponent.element.disabled = false;
  }

  function handleNewEventButtonClick() {
    tripPresenter.createEvent();
    newEventButtonComponent.element.disabled = true;
  }

  filterPresenter.init();
  tripPresenter.init();
  eventsModel.init()
    .finally(() => {
      render(newEventButtonComponent, siteTripMainElement);
    });
}

main();
