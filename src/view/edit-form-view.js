import AbstractPointFormView from './abstract-point-form-view.js';
import dayjs from 'dayjs';

function createEditFormTemplate(point, allOffers, destinationsList) {
  const {
    type,
    dateFrom,
    dateTo,
    basePrice,
    offers: selectedOfferIds,
    destination: destinationId
  } = point;

  const destination = destinationsList.find((currentDestination) => currentDestination.id === destinationId) || {};
  const {
    name: destinationName = '',
    description: destinationDescription = '',
    pictures: destinationPictures = []
  } = destination;

  const format = (date) => dayjs(date).format('DD/MM/YY HH:mm');

  const eventForType = allOffers.find((offer) => offer.type === type);
  const offersForType = eventForType ? eventForType.offers : [];

  const offersTemplate = offersForType.map((offer) => `
    <div class="event__offer-selector">
      <input
        class="event__offer-checkbox visually-hidden"
        id="event-offer-${offer.id}"
        type="checkbox"
        data-offer-id="${offer.id}"
        ${selectedOfferIds.includes(offer.id) ? 'checked' : ''}
      >
      <label class="event__offer-label" for="event-offer-${offer.id}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
      </label>
    </div>
  `).join('');

  const destinationsOptions = destinationsList
    .map((currentDestination) => `<option value="${currentDestination.name}"></option>`)
    .join('');

  const photosTemplate = destinationPictures.length
    ? `
      <div class="event__photos-container">
        <div class="event__photos-tape">
          ${destinationPictures.map((picture) => `
            <img class="event__photo" src="${picture.src}" alt="${picture.description}">
          `).join('')}
        </div>
      </div>
    `
    : '';

  return `
    <form class="event event--edit" action="#" method="post">
      <header class="event__header">

        <div class="event__type-wrapper">
          <label class="event__type  event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17"
              src="img/icons/${type}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">

          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>

              ${['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'].map((offerType) => `
                  <div class="event__type-item">
                    <input id="event-type-${offerType}-1"
                      class="event__type-input visually-hidden"
                      type="radio" name="event-type" value="${offerType}"
                      ${type === offerType ? 'checked' : ''}>
                    <label class="event__type-label event__type-label--${offerType}"
                      for="event-type-${offerType}-1">${offerType[0].toUpperCase() + offerType.slice(1)}</label>
                  </div>
                `).join('')}
            </fieldset>
          </div>
        </div>

        <div class="event__field-group event__field-group--destination">
          <label class="event__label event__type-output" for="event-destination-1">
            ${type}
          </label>
          <input class="event__input event__input--destination"
            id="event-destination-1" type="text" name="event-destination"
            value="${destinationName}" list="destination-list-1">

          <datalist id="destination-list-1">
            ${destinationsOptions}
          </datalist>
        </div>

        <div class="event__field-group event__field-group--time">
          <input class="event__input event__input--time"
            id="event-start-time-1" type="text" name="event-start-time"
            value="${format(dateFrom)}">
          &mdash;
          <input class="event__input event__input--time"
            id="event-end-time-1" type="text" name="event-end-time"
            value="${format(dateTo)}">
        </div>

        <div class="event__field-group event__field-group--price">
          <label class="event__label" for="event-price-1">&euro;</label>
          <input class="event__input event__input--price"
            id="event-price-1" type="text" name="event-price"
            value="${basePrice}">
        </div>

        <button class="event__save-btn btn btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Delete</button>

        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>

      </header>

      <section class="event__details">
        ${offersForType.length > 0 ? `
  <section class="event__section event__section--offers">
    <h3 class="event__section-title event__section-title--offers">Offers</h3>
    <div class="event__available-offers">
      ${offersTemplate}
    </div>
  </section>
` : ''}

        ${destinationDescription ? `
          <section class="event__section event__section--destination">
            <h3 class="event__section-title event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${destinationDescription}</p>
            ${photosTemplate}
          </section>
        ` : ''}
      </section>
    </form>
  `;
}

export default class EditFormView extends AbstractPointFormView {
  #allOffers;
  #destinationsList;
  #onFormSubmit;
  #onRollupClick;
  #onDeleteClick;

  constructor({ point, offers, destinationsList, onFormSubmit, onRollupClick, onDeleteClick }) {
    super();
    this._setState(EditFormView.parsePointToState(point));

    this.#allOffers = offers;
    this.#destinationsList = destinationsList;
    this.#onFormSubmit = onFormSubmit;
    this.#onRollupClick = onRollupClick;
    this.#onDeleteClick = onDeleteClick;
  }

  get template() {
    return createEditFormTemplate(
      this._state,
      this.#allOffers,
      this.#destinationsList
    );
  }

  updateElement(update) {
    super.updateElement(update);
    this._restoreHandlers();
  }

  reset(point) {
    this.updateElement(EditFormView.parsePointToState(point));
  }

  _restoreHandlers() {
    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#onRollupClickHandler);

    this.element.addEventListener('submit', this.#formSubmitHandler);

    this.element.querySelector('.event__type-list')
      .addEventListener('change', this.#eventTypeChangeHandler);

    this.element.querySelector('.event__input--destination')
      .addEventListener('input', this.#destinationChangeHandler);

    //проверяем, существует ли секция предложений
    const offersContainer = this.element.querySelector('.event__available-offers');
    if (offersContainer) {
      offersContainer.addEventListener('change', this._handleOffersChange.bind(this));
    }

    // DELETE
    this.element.querySelector('.event__reset-btn')
      .addEventListener('click', this.#formDeleteHandler);


    this.element.querySelector('.event__input--price')
      .addEventListener('input', this._handlePriceChange.bind(this));


    this._initDatepickers(
      '#event-start-time-1',
      '#event-end-time-1',
      this._state,
      (date) => this._setState({ dateFrom: date }),
      (date) => this._setState({ dateTo: date })
    );
  }

  #onRollupClickHandler = (evt) => {
    evt.preventDefault();
    this.#onRollupClick();
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#onFormSubmit(EditFormView.parseStateToPoint(this._state));
  };

  #eventTypeChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({ type: evt.target.value });
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const name = evt.target.value;
    const found = this.#destinationsList.find((d) => d.name === name);
    this.updateElement({ destination: found?.id || null });
  };

  #formDeleteHandler = (evt) => {
    evt.preventDefault();
    this.#onDeleteClick(EditFormView.parseStateToPoint(this._state));
  };


}
