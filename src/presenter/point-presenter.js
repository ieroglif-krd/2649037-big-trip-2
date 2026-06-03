import PointView from '../view/point-view.js';
import EditFormView from '../view/edit-form-view.js';
import { render, replace, remove } from '../framework/render.js';
import { isEsc } from '../utils.js';


export default class PointPresenter {
  #pointComponent = null;
  #pointEditComponent = null;
  #pointsListContainer = null;
  #point = null;
  #allEvents = null;
  #destinationsList = null;
  #pointsModel = null;

  constructor({pointsModel, container}) {
    this.#pointsModel = pointsModel;
    this.#pointsListContainer = container;

  }

  init(point) {
    this.#point = point;
    const prevPointComponent = this.#pointComponent;
    const prevPointEditComponent = this.#pointEditComponent;

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

    if (prevPointComponent === null || prevPointEditComponent === null) {
      render(this.#pointComponent, this.#pointsListContainer);
      return;
    }

    // Проверка на наличие в DOM необходима,
    // чтобы не пытаться заменить то, что не было отрисовано
    if (this.#pointsListContainer.contains(prevPointComponent.element)) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#pointsListContainer.contains(prevPointEditComponent.element)) {
      replace(this.#pointEditComponent, prevPointEditComponent);
    }

    remove(prevPointComponent);
    remove(prevPointEditComponent);
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
    if (isEsc(evt)) {
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

  destroy() {
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
  }
}
