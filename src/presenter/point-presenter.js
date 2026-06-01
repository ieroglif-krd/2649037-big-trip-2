import PointView from '../view/point-view.js';
import EditFormView from '../view/edit-form-view.js';
import { render, replace } from '../framework/render.js';


export default class PointPresenter {
  #pointComponent = null;
  #pointEditComponent = null;
  #container = null;
  #point = null;
  #allEvents = null;
  #destinationsList = null;
  #pointsModel = null;

  constructor({pointsModel, container}) {
    this.#pointsModel = pointsModel;
    this.#container = container;

  }

  init(point) {
    this.#point = point;

    this.#pointComponent = new PointView({
      point,
      offers: this.#pointsModel.getOffersForPoint(point),
      destination: this.#pointsModel.getDestination(point),
      onEditClick: this.#handleEditClick
    });

    this.#pointEditComponent = new EditFormView({
      point,
      offers: this.#pointsModel.getEvents(),
      destinationsList: this.#pointsModel.getDestinations(),
      onFormSubmit: this.#handleFormSubmit,
      onRollupClick: this.#handleRollupClick
    });

    render(this.#pointComponent, this.#container);
  }

  #replaceCardToForm = () => {
    replace(this.#pointEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
  };

  #replaceFormToCard = () => {
    replace(this.#pointComponent, this.#pointEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#replaceFormToCard();
    }
  };

  #handleEditClick = () => {
    this.#replaceCardToForm();
  };

  #handleFormSubmit = () => {
    this.#replaceFormToCard();
  };

  #handleRollupClick = () => {
    this.#replaceFormToCard();
  };
}
