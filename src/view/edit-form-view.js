import NewPointFormView from './new-point-form-view.js';

export default class EditFormView extends NewPointFormView {
  #handleDelete = null;
  #handleRollup = null;

  constructor({ point, offers, destinations, onSubmit, onDelete, onRollup }) {
    super({
      offers,
      destinations,
      onSubmit,
      onCancel: onRollup // rollup заменяет cancel
    });

    this.#handleDelete = onDelete;
    this.#handleRollup = onRollup;

    this._setState(EditFormView.parsePointToState(point));
  }

  // Переопределяем кнопки
  getButtonsTemplate() {
    return `
      <button class="event__save-btn btn btn--blue" type="submit">
        ${this._state.isSaving ? 'Saving...' : 'Save'}
      </button>

      <button class="event__reset-btn" type="reset">
        ${this._state.isDeleting ? 'Deleting...' : 'Delete'}
      </button>

      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    `;
  }


  _restoreHandlers() {
    // сначала общие обработчики
    super._restoreHandlers();

    // DELETE
    const deleteButton = this.element.querySelector('.event__reset-btn');
    deleteButton.addEventListener('click', this.#onDeleteButtonClick);

    // ROLLUP
    const rollupButton = this.element.querySelector('.event__rollup-btn');
    rollupButton.addEventListener('click', this.#onRollupButtonClick);
  }

  // updateElement(update) {
  //   super.updateElement(update);
  //   this._restoreHandlers();
  // }

  #onDeleteButtonClick = (evt) => {
    evt.preventDefault();
    this.#handleDelete(EditFormView.parseStateToPoint(this._state));
  };

  #onRollupButtonClick = (evt) => {
    evt.preventDefault();
    this.#handleRollup();
  };

}
