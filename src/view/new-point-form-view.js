import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import dayjs from 'dayjs';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import he from 'he';
import { POINT_EMPTY, DELAY_TIME, DATE_FORMAT } from '../const.js';

function createNewPointFormTemplate(
  state,
  allOffers,
  destinationsList,
  buttonsTemplate,
) {
  const { type, destination, dateFrom, dateTo, basePrice, offers, isDisabled } =
    state;

  const destinationData =
    destinationsList.find(
      (destinationItem) => destinationItem.id === destination,
    ) || {};

  const destinationName = he.encode(destinationData.name || '');

  const offersForType =
    allOffers.find((offerGroup) => offerGroup.type === type)?.offers || [];

  const offersTemplate = offersForType
    .map(
      (offerItem) => `
      <div class="event__offer-selector">
        <input
          class="event__offer-checkbox visually-hidden"
          id="event-offer-${offerItem.id}"
          type="checkbox"
          value="${offerItem.id}"
          ${offers.includes(offerItem.id) ? 'checked' : ''}
          ${isDisabled ? 'disabled' : ''}
        >
        <label class="event__offer-label" for="event-offer-${offerItem.id}">
          <span class="event__offer-title">${he.encode(offerItem.title)}</span>
          &plus;&euro;&nbsp;<span class="event__offer-price">${he.encode(String(offerItem.price))}</span>
        </label>
      </div>
    `,
    )
    .join('');

  const photosTemplate =
    destinationData.pictures && destinationData.pictures.length > 0
      ? `
        <section class="event__section event__section--destination">
          <h3 class="event__section-title event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${he.encode(destinationData.description || '')}</p>

          <div class="event__photos-container">
            <div class="event__photos-tape">
              ${destinationData.pictures.map((pictureItem) => `
                <img class="event__photo" src="${he.encode(pictureItem.src)}" alt="${he.encode(pictureItem.description)}">
              `,).join('')}
            </div>
          </div>
        </section>
      `
      : '';

  return `
    <form class="event event--edit" action="#" method="post" autocomplete="off">
      <header class="event__header">

        <!-- TYPE -->
        <div class="event__type-wrapper">
          <label class="event__type event__type-btn" for="event-type-toggle">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17"
              src="img/icons/${he.encode(type)}.png" alt="Event type icon">
          </label>

          <input
            class="event__type-toggle visually-hidden"
            id="event-type-toggle"
            type="checkbox"
            ${isDisabled ? 'disabled' : ''}
          >

          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>

              ${allOffers.map((offerGroup) => `
                <div class="event__type-item">
                  <input
                    id="event-type-${he.encode(offerGroup.type)}"
                    class="event__type-input visually-hidden"
                    type="radio"
                    name="event-type"
                    value="${he.encode(offerGroup.type)}"
                    ${offerGroup.type === type ? 'checked' : ''}
                    ${isDisabled ? 'disabled' : ''}
                  >
                  <label
                    class="event__type-label event__type-label--${he.encode(offerGroup.type)}"
                    for="event-type-${he.encode(offerGroup.type)}"
                  >
                    ${he.encode(offerGroup.type)}
                  </label>
                </div>
              `,).join('')}
            </fieldset>
          </div>
        </div>

        <!-- DESTINATION -->
        <div class="event__field-group event__field-group--destination">
          <label class="event__label event__type-output" for="event-destination">
            ${he.encode(type)}
          </label>

          <input
            class="event__input event__input--destination"
            id="event-destination"
            type="text"
            name="event-destination"
            value="${destinationName}"
            list="destination-list"
            ${isDisabled ? 'disabled' : ''}
          >

          <datalist id="destination-list">
            ${destinationsList.map((destinationItem) => `
              <option
                value="${he.encode(destinationItem.name)}"
                data-destination-id="${destinationItem.id}"
              ></option>
            `,).join('')}
          </datalist>
        </div>

        <!-- DATE -->
        <div class="event__field-group event__field-group--time">
          <label class="visually-hidden" for="event-start-time">From</label>

          <input
            class="event__input event__input--time"
            id="event-start-time"
            type="text"
            name="event-start-time"
            value="${dateFrom ? he.encode(dayjs(dateFrom).format('DD/MM/YY HH:mm')) : ''}"
            ${isDisabled ? 'disabled' : ''}
          >

          &mdash;

          <label class="visually-hidden" for="event-end-time">To</label>

          <input
            class="event__input event__input--time"
            id="event-end-time"
            type="text"
            name="event-end-time"
            value="${dateTo ? he.encode(dayjs(dateTo).format('DD/MM/YY HH:mm')) : ''}"
            ${isDisabled ? 'disabled' : ''}
          >
        </div>

        <!-- PRICE -->
        <div class="event__field-group event__field-group--price">
          <label class="event__label" for="event-price">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>

          <input
            class="event__input event__input--price"
            id="event-price"
            type="text"
            name="event-price"
            value="${he.encode(String(basePrice))}"
            ${isDisabled ? 'disabled' : ''}
          >
        </div>

        <!-- BUTTONS -->
        ${buttonsTemplate}

      </header>

      <section class="event__details">

        <!-- OFFERS -->
        ${offersForType.length > 0 ? `
          <section class="event__section event__section--offers">
            <h3 class="event__section-title event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${offersTemplate}
            </div>
          </section>
        ` : ''
}

        <!-- DESTINATION DETAILS -->
        ${photosTemplate}

      </section>
    </form>
  `;
}

export default class NewPointFormView extends AbstractStatefulView {
  #offers = null;
  #destinations = null;
  #handleSubmit = null;
  #handleCancel = null;
  #startDatepicker = null;
  #endDatepicker = null;

  constructor({ offers, destinations, onSubmit, onCancel }) {
    super();
    this.#offers = offers;
    this.#destinations = destinations;
    this.#handleSubmit = onSubmit;
    this.#handleCancel = onCancel;
    this._setState(POINT_EMPTY);
  }

  get template() {
    return createNewPointFormTemplate(
      this._state,
      this.#offers,
      this.#destinations,
      this.getButtonsTemplate(),
    );
  }

  getButtonsTemplate() {
    return `
      <button class="event__save-btn btn btn--blue" type="submit">
        ${this._state.isSaving ? 'Saving...' : 'Save'}
      </button>

      <button class="event__reset-btn" type="reset">
        ${this._state.isDeleting ? 'Deleting...' : 'Cancel'}
      </button>
    `;
  }

  _restoreHandlers() {
    this.#restoreTypeHandlers();
    this.#restoreDestinationHandlers();
    this.#restorePriceHandlers();
    this.#restoreOffersHandlers();
    this.#restoreSubmitHandlers();
    this.#restoreCancelHandlers();
    this.#initDatepickersHandlers();
    this._validateForm();
  }

  removeElement() {
    super.removeElement();

    if (this.#startDatepicker) {
      this.#startDatepicker.destroy();
    }

    if (this.#endDatepicker) {
      this.#endDatepicker.destroy();
    }
  }

  _getDestinationIdByName(name, list) {
    const foundDestination = list.find(
      (destinationItem) => destinationItem.name === name,
    );
    return foundDestination ? foundDestination.id : null;
  }

  _handleTypeChange(event) {
    event.preventDefault();
    this._setState({
      type: event.target.value,
      offers: [],
    });

    this.updateElement({
      type: event.target.value,
      offers: [],
    });
  }

  _handleOffersChange() {
    const offersChecked = this.element.querySelectorAll(
      '.event__offer-checkbox:checked',
    );
    this._setState({
      offers: [...offersChecked].map((offerElement) => offerElement.value),
    });
  }

  _handleDestinationChange(event, destinationsList) {
    const name = event.target.value.trim();
    const destinationId = this._getDestinationIdByName(name, destinationsList);

    if (destinationId === null) {
      this._setState({ destination: null });
      return this._validateForm();
    }

    this.updateElement({ destination: destinationId });
    this._validateForm();

  }

  _handlePriceChange(event) {
    event.target.value = event.target.value.replace(/\D/g, '');
    const price = Number(event.target.value);

    this._setState({
      basePrice: price,
    });
    this._validateForm();
  }

  _initDatepickers(startSelector, endSelector, state, onStart, onEnd) {
    this.#initStartDatepicker(startSelector, state, onStart, onEnd);
    this.#initEndDatepicker(endSelector, state, onEnd);
  }

  #initStartDatepicker(selector, state, onStart, onEnd) {
    const startInput = this.element.querySelector(selector);

    this.#startDatepicker = flatpickr(startInput, {
      enableTime: true,
      dateFormat: DATE_FORMAT,
      defaultDate: state.dateFrom,
      minDate: 'today',
      onChange: ([date]) => {
        onStart(date);
        this._validateForm();
        this.#endDatepicker.set('minDate', date);

        if (this._state.dateTo < date) {
          const newEnd = this.#getCorrectedEndDate(date);
          onEnd(newEnd);
          this.#endDatepicker.setDate(newEnd, false);
        }
      },
    });
  }

  #initEndDatepicker(selector, state, onEnd) {
    const endInput = this.element.querySelector(selector);

    this.#endDatepicker = flatpickr(endInput, {
      enableTime: true,
      dateFormat: DATE_FORMAT,
      defaultDate: state.dateTo,
      minDate: state.dateFrom,
      onChange: ([date]) => {
        onEnd(date);
        this._validateForm();
      },
    });
  }

  #getCorrectedEndDate(date) {
    return new Date(date.getTime() + DELAY_TIME);
  }

  _validateForm() {
    const saveButton = this.element.querySelector('.event__save-btn');

    const { destination, dateFrom, dateTo, basePrice } = this._state;

    const isValid =
      destination !== null &&
      dateFrom !== null &&
      dateTo !== null &&
      basePrice > 0;

    saveButton.disabled = !isValid;
  }

  reset(point) {
    this.updateElement(NewPointFormView.parsePointToState(point));
  }

  // ОБРАБОТЧИКИ СОБЫТИЙ — ИМЕНОВАННЫЕ МЕТОДЫ

  _onTypeGroupChange = (evt) => {
    this._handleTypeChange(evt);
  };

  _onDestinationInputChange = (evt) => {
    this._handleDestinationChange(evt, this.#destinations);
  };

  _onPriceInputChange = (evt) => {
    this._handlePriceChange(evt);
  };

  _onOfferCheckboxChange = () => {
    this._handleOffersChange();
  };

  _onSaveButtonClick = (evt) => {
    evt.preventDefault();
    this.#handleSubmit(NewPointFormView.parseStateToPoint(this._state));
  };

  _onResetButtonClick = (evt) => {
    evt.preventDefault();
    this.#handleCancel();
  };

  #restoreTypeHandlers() {
    const typeGroupElement = this.element.querySelector('.event__type-group');
    typeGroupElement.addEventListener('change', this._onTypeGroupChange);
  }

  #restoreDestinationHandlers() {
    const destinationInputElement = this.element.querySelector(
      '.event__input--destination',
    );
    destinationInputElement.addEventListener(
      'input',
      this._onDestinationInputChange,
    );
  }

  #restorePriceHandlers() {
    const priceInputElement = this.element.querySelector(
      '.event__input--price',
    );
    priceInputElement.addEventListener('input', this._onPriceInputChange);
  }

  #restoreOffersHandlers() {
    const offerCheckboxElements = this.element.querySelectorAll(
      '.event__offer-checkbox',
    );
    offerCheckboxElements.forEach((checkbox) =>
      checkbox.addEventListener('change', this._onOfferCheckboxChange),
    );
  }

  #restoreSubmitHandlers() {
    const saveButtonElement = this.element.querySelector('.event__save-btn');
    saveButtonElement.addEventListener('click', this._onSaveButtonClick);
  }

  #restoreCancelHandlers() {
    const resetButtonElement = this.element.querySelector('.event__reset-btn');
    resetButtonElement.addEventListener('click', this._onResetButtonClick);
  }

  #initDatepickersHandlers() {
    this._initDatepickers(
      '#event-start-time',
      '#event-end-time',
      this._state,
      (date) => this._setState({ dateFrom: date }),
      (date) => this._setState({ dateTo: date }),
    );
  }

  static parsePointToState(point) {
    return {
      ...point,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    };
  }

  static parseStateToPoint(state) {
    const point = { ...state };

    delete point.isDisabled;
    delete point.isSaving;
    delete point.isDeleting;

    return point;
  }
}
