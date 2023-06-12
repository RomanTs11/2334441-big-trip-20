import { render, replace } from '../framework/render.js';
import ListEvent from '../view/event-list-view.js';
import EventsItemView from '../view/events-item-view.js';
import FormItemEvent from '../view/form-item-event.js';

export default class EventPresenter {
  eventComponent = new ListEvent();

  constructor({listContainer, pointsModel, offersModel, destinationsModel}){
    this.listContainer = listContainer;
    this.point = pointsModel;
    this.offer = offersModel;
    this.destination = destinationsModel;
    this.points = pointsModel.get();
  }

  #renderPoint = (point) => {
    const pointComponent = new EventsItemView({
      point,
      pointDestination : this.destination.getById(point.destination),
      pointOffers: this.offer.getByType(point.type)
    });
    render(pointComponent,this.eventComponent.element);

    const pointEditComponent = new FormItemEvent({
      point,
      pointDestination : this.destination.get(),
      pointOffers: this.offer.get()
    });

    const replacePointToEdit = () => {
      replace(pointEditComponent, pointComponent);
    };
    const replaceEditToPoint = () => {
      replace(pointComponent, pointEditComponent);
    };

    pointComponent.setEditHandler(()=>replacePointToEdit());
    pointEditComponent.setEditHandler(()=>replaceEditToPoint());
    render(pointComponent,this.eventComponent.element);
  };

  #renderEditPoint = (point) => {
    const pointEditComponent = new FormItemEvent({
      point,
      pointDestination : this.destination.get(),
      pointOffers: this.offer.get()
    });
    render(pointEditComponent,this.eventComponent.element);
  };

  init(){
    render(this.eventComponent,this.listContainer);
    this.points.forEach((point)=> {
      this.#renderEditPoint(point);
      this.#renderPoint(point);
    });

  }
}
