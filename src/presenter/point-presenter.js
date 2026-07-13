import PointView from '../view/point-view.js';
import EditFormView from '../view/edit-form-view.js';
import { render, replace, remove } from '../framework/render.js';
import { isEsc } from '../utils.js';
import { UserAction, UpdateType } from '../const.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #component = null;
  #editComponent = null;
  #listContainer = null;
  #point = null;
  #allEvents = null;
  #destinationsList = null;
  #pointsModel = null;
  #handleDataChange = null;
  #handleModeChange = null;
  #mode = Mode.DEFAULT;


  constructor({ pointsModel, container, onDataChange, onModeChange }) {
    this.#pointsModel = pointsModel;
    this.#listContainer = container;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point) {
    this.#point = point;
    const prevPointComponent = this.#component;
    const prevPointEditComponent = this.#editComponent;

    this.#createComponents(point);

    if (!prevPointComponent || !prevPointEditComponent) {
      return this.#renderInitial();
    }

    this.#renderUpdated(prevPointComponent, prevPointEditComponent);
  }

  #createComponents(point) {
    this.#component = new PointView({
      point: this.#createPointView(point),
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick
    });

    this.#editComponent = new EditFormView({
      point,
      offers: this.#pointsModel.offers,
      destinations: this.#pointsModel.destinations,
      onSubmit: this.#handleFormSubmit,
      onDelete: this.#handleDeleteClick,
      onRollup: this.#handleRollupClick
    });
  }

  #renderInitial() {
    this.#renderPoint();
  }

  #renderUpdated(prevPointComponent, prevPointEditComponent) {
    if (this.#mode === Mode.DEFAULT) {
      this.#replacePoint(prevPointComponent, this.#component);
    } else {
      this.#replacePoint(prevPointEditComponent, this.#component);
    }

    this.#removePoint(prevPointComponent);
    this.#removePoint(prevPointEditComponent);
  }


  #replaceCardToForm = () => {
    replace(this.#editComponent, this.#component);
    this.#editComponent._restoreHandlers();
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  };

  #replaceFormToCard = () => {
    replace(this.#component, this.#editComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  };

  #createPointView(point) {
    return {
      ...point,
      destination: this.#pointsModel.getDestination(point),
      offers: this.#pointsModel.getOffersForPoint(point),
      eventData: this.#pointsModel.getEventByType(point.type)
    };
  }


  #escKeyDownHandler = (evt) => {
    if (isEsc(evt)) {
      evt.preventDefault();
      this.#editComponent.reset(this.#point);
      this.#replaceFormToCard();
    }
  };

  #handleEditClick = () => {
    this.#replaceCardToForm();
  };

  #handleFormSubmit = (update) => {
    this.setSaving();
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      update,
    );
  };

  #handleRollupClick = () => {
    this.#editComponent.reset(this.#point);
    this.#replaceFormToCard();
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      { ...this.#point, isFavorite: !this.#point.isFavorite },
    );
  };

  #handleDeleteClick = (point) => {
    this.setDeleting();
    this.#handleDataChange(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      point,
    );
  };

  #renderPoint() {
    render(this.#component, this.#listContainer);
  }

  #replacePoint(oldComponent, newComponent) {
    replace(newComponent, oldComponent);
  }

  #removePoint(component) {
    remove(component);
  }


  destroy() {
    this.#removePoint(this.#component);
    this.#removePoint(this.#editComponent);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#editComponent.reset({
        ...this.#point,
        isDisabled: false,
        isSaving: false,
        isDeleting: false
      });

      this.#replaceFormToCard();
    }

  }

  setSaving() {
    if (this.#mode === Mode.EDITING) {
      this.#editComponent.updateElement({
        ...this.#editComponent._state,
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  setDeleting() {
    if (this.#mode === Mode.EDITING) {
      this.#editComponent.updateElement({
        ...this.#editComponent._state,
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  setAborting() {
    // Если форма сейчас не открыта — качаем карточку
    if (this.#mode === Mode.DEFAULT) {
      return this.#component.shake();
    }

    // Если форма открыта — качаем форму и после анимации сбрасываем состояние
    const resetFormState = () => {
      this.#editComponent.updateElement({
        ...this.#editComponent._state,
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#editComponent.shake(resetFormState);
  }

}
