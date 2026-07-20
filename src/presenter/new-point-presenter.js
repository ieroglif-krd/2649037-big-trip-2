import { render, remove } from '../framework/render.js';
import { isEsc } from '../utils.js';
import NewPointFormView from '../view/new-point-form-view.js';

export default class NewPointPresenter {
  #container = null;
  #offers = null;
  #destinations = null;
  #handleSubmit = null;
  #handleCancel = null;
  #formComponent = null;

  constructor({ container, offers, destinations, onSubmit, onCancel }) {
    this.#container = container;
    this.#offers = offers;
    this.#destinations = destinations;
    this.#handleSubmit = onSubmit;
    this.#handleCancel = onCancel;
  }

  init() {
    this.#formComponent = new NewPointFormView({
      offers: this.#offers,
      destinations: this.#destinations,
      onSubmit: this.#handleSubmit,
      onCancel: this.#handleCancel
    });

    render(this.#formComponent, this.#container, 'afterbegin');
    this.#formComponent._restoreHandlers();

    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  setSaving() {
    this.#formComponent.setSaving();
  }

  destroy() {
    remove(this.#formComponent);
    this.#formComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  #escKeyDownHandler = (event) => {
    if (isEsc(event)) {
      event.preventDefault();
      this.#handleCancel();
    }
  };

  setAborting() {
    const resetFormState = () => {
      this.#formComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#formComponent.shake(resetFormState);
  }

}
