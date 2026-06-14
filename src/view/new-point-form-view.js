import AbstractPointFormView from './abstract-point-form-view.js';
import dayjs from 'dayjs';

function createNewPointTemplate(point, allOffers, destinationsList) {
  const {
    type,
    dateFrom,
    dateTo,
    basePrice,
    offers: selectedOfferIds,
    destination: destinationId
  } = point;

  const destination = destinationsList.find((d) => d.id === destinationId) || {};
  const {
    name: destinationName = '',
    description: destinationDescription = '',
    pictures: destinationPictures = []
  } = destination;

  const format = (date) => dayjs(date).format('DD/MM/YY HH:mm');

  const eventForType = allOffers.find((o) => o.type === type);
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
    .map((d) => `<option value="${d.name}"></option>`)
    .join('');

  const photosTemplate = destinationPictures.length
    ? `
      <div class="event__photos-container">
        <div class="event__photos-tape">
          ${destinationPictures.map((p) => `
            <img class="event__photo" src="${p.src}" alt="${p.description}">
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

              ${['taxi','bus','train','ship','drive','flight','check-in','sightseeing','restaurant'].map((t) => `
                  <div class="event__type-item">
                    <input id="event-type-${t}-1"
                      class="event__type-input visually-hidden"
                      type="radio" name="event-type" value="${t}"
                      ${t === type ? 'checked' : ''}>
                    <label class="event__type-label event__type-label--${t}"
                      for="event-type-${t}-1">${t[0].toUpperCase() + t.slice(1)}</label>
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
        <button class="event__reset-btn" type="reset">Cancel</button>

      </header>

      <section class="event__details">
        <section class="event__section event__section--offers">
          <h3 class="event__section-title event__section-title--offers">Offers</h3>
          <div class="event__available-offers">
            ${offersTemplate}
          </div>
        </section>

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


export default class NewPointFormView extends AbstractPointFormView {
  #onCancel;

  constructor({ point, offers, destinationsList, onSubmit, onCancel }) {
    super({ point, offers, destinationsList });

    this.#onCancel = onCancel;
    this.setSubmitHandler(onSubmit);
  }

  get template() {
    return createNewPointTemplate(
      this._state,
      this.offers,
      this.destinations
    );
  }

  _restoreHandlers() {
    super._restoreHandlers();

    this.element
      .querySelector('.event__reset-btn')
      ?.addEventListener('click', (evt) => {
        evt.preventDefault();
        this.#onCancel();
      });
  }
}
