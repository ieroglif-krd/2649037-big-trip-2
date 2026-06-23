import AbstractPointFormView from './abstract-point-form-view.js';
import { POINT_EMPTY } from '../const.js';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';

function createNewPointFormTemplate(state, allOffers, destinationsList) {
  const {
    type,
    destination,
    dateFrom,
    dateTo,
    basePrice,
    offers
  } = state;

  const destinationData = destinationsList.find((destinationItem) => destinationItem.id === destination) || {};
  const destinationName = destinationData.name || '';

  const offersForType = allOffers.find((offerGroup) => offerGroup.type === type);
  const availableOffers = offersForType ? offersForType.offers : [];

  return `
    <form class="event event--edit" action="#" method="post">
      <header class="event__header">

        <!-- TYPE -->
        <div class="event__type-wrapper">
          <label class="event__type event__type-btn" for="event-type-toggle-new">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle visually-hidden" id="event-type-toggle-new" type="checkbox">

          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>

              ${allOffers.map((offerGroup) => `
                <div class="event__type-item">
                  <input
                    id="event-type-${offerGroup.type}-new"
                    class="event__type-input visually-hidden"
                    type="radio"
                    name="event-type"
                    value="${offerGroup.type}"
                    ${offerGroup.type === type ? 'checked' : ''}
                  >
                  <label
                    class="event__type-label event__type-label--${offerGroup.type}"
                    for="event-type-${offerGroup.type}-new"
                  >
                    ${offerGroup.type}
                  </label>
                </div>
              `).join('')}
            </fieldset>
          </div>
        </div>

        <!-- DESTINATION -->
        <div class="event__field-group event__field-group--destination">
          <label class="event__label event__type-output" for="event-destination-new">
            ${type}
          </label>
          <input
            class="event__input event__input--destination"
            id="event-destination-new"
            type="text"
            name="event-destination"
            value="${destinationName}"
            list="destination-list-new"
          >

          <datalist id="destination-list-new">
            ${destinationsList.map((destinationItem) => `
              <option value="${destinationItem.name}"></option>`).join('')}
          </datalist>
        </div>

        <!-- DATE -->
        <div class="event__field-group event__field-group--time">
          <label class="visually-hidden" for="event-start-time-new">From</label>
          <input
            class="event__input event__input--time"
            id="event-start-time-new"
            type="text"
            name="event-start-time"
            value="${dayjs(dateFrom).format('DD/MM/YY HH:mm')}"
          >

          &mdash;

          <label class="visually-hidden" for="event-end-time-new">To</label>
          <input
            class="event__input event__input--time"
            id="event-end-time-new"
            type="text"
            name="event-end-time"
            value="${dayjs(dateTo).format('DD/MM/YY HH:mm')}"
          >
        </div>

        <!-- PRICE -->
        <div class="event__field-group event__field-group--price">
          <label class="event__label" for="event-price-new">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input
            class="event__input event__input--price"
            id="event-price-new"
            type="text"
            name="event-price"
            value="${basePrice}"
          >
        </div>

        <button class="event__save-btn btn btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Cancel</button>
      </header>

      <section class="event__details">

        <!-- OFFERS -->
        ${availableOffers.length > 0 ? `
          <section class="event__section event__section--offers">
            <h3 class="event__section-title event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${availableOffers.map((offerItem) => `
                <div class="event__offer-selector">
                  <input
                    class="event__offer-checkbox visually-hidden"
                    id="event-offer-${offerItem.id}-new"
                    type="checkbox"
                    data-offer-id="${offerItem.id}"
                    ${offers.includes(offerItem.id) ? 'checked' : ''}
                  >
                  <label class="event__offer-label" for="event-offer-${offerItem.id}-new">
                    <span class="event__offer-title">${offerItem.title}</span>
                    &plus;&euro;&nbsp;<span class="event__offer-price">${offerItem.price}</span>
                  </label>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <!-- DESTINATION DETAILS -->
        ${destinationData.description ? `
          <section class="event__section event__section--destination">
            <h3 class="event__section-title event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${destinationData.description}</p>

            <div class="event__photos-container">
              <div class="event__photos-tape">
                ${destinationData.pictures.map((pictureItem) => `
                  <img class="event__photo" src="${pictureItem.src}" alt="${pictureItem.description}">`).join('')}
              </div>
            </div>
          </section>
        ` : ''}

      </section>
    </form>
  `;
}

export default class NewPointFormView extends AbstractPointFormView {
  #offers = null;
  #destinations = null;
  #handleSubmit = null;
  #handleCancel = null;

  constructor({ offers, destinations, onSubmit, onCancel }) {
    super();

    this.#offers = offers;
    this.#destinations = destinations;
    this.#handleSubmit = onSubmit;
    this.#handleCancel = onCancel;

    this._setState(POINT_EMPTY);

  }

  get template() {
    return createNewPointFormTemplate(this._state, this.#offers, this.#destinations);
  }

  _restoreHandlers() {
    // TYPE
    this.element.querySelector('.event__type-group')
      .addEventListener('change', (event) => {
        this._handleTypeChange(event);
      });

    // DESTINATION
    this.element.querySelector('.event__input--destination')
      .addEventListener('change', (event) => {
        this._handleDestinationChange(event, this.#destinations);
      });

    // PRICE
    this.element.querySelector('.event__input--price')
      .addEventListener('input', (event) => {
        this._handlePriceChange(event);
      });

    // OFFERS
    this.element.querySelectorAll('.event__offer-checkbox')
      .forEach((checkboxElement) => {
        checkboxElement.addEventListener('change', (event) => {
          this._handleOffersChange(event);
        });
      });

    // SUBMIT
    this.element.querySelector('.event__save-btn')
      .addEventListener('click', (event) => {
        event.preventDefault();
        this.#handleSubmit(NewPointFormView.parseStateToPoint(this._state));
      });

    // CANCEL
    this.element.querySelector('.event__reset-btn')
      .addEventListener('click', (event) => {
        event.preventDefault();
        this.#handleCancel();
      });

    // DATEPICKERS
    this._initDatepickers(
      '#event-start-time-new',
      '#event-end-time-new',
      this._state,
      (date) => this._setState({ dateFrom: date }),
      (date) => this._setState({ dateTo: date })
    );
  }

  static parseStateToPoint(state) {
    return {
      ...state,
      id: nanoid()
    };
  }
}
