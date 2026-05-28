import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';

function createEditFormTemplate(point, allOffers, destinationName) {
  const {
    type,
    dateFrom,
    dateTo,
    basePrice,
    offers: selectedOfferIds
  } = point;

  const formatForInput = (date) => dayjs(date).format('DD/MM/YY HH:mm');

  const start = formatForInput(dateFrom);
  const end = formatForInput(dateTo);

  // Генерация списка офферов
  const offersTemplate = allOffers.map((offer) => {
    const isChecked = selectedOfferIds.includes(offer.id);

    return `
      <div class="event__offer-selector">
        <input
          class="event__offer-checkbox visually-hidden"
          id="event-offer-${offer.id}-1"
          type="checkbox"
          ${isChecked ? 'checked' : ''}
        >
        <label class="event__offer-label" for="event-offer-${offer.id}-1">
          <span class="event__offer-title">${offer.title}</span>
          &plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
        </label>
      </div>
    `;
  }).join('');

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

              ${['taxi','bus','train','ship','drive','flight','check-in','sightseeing','restaurant']
    .map((t) => `
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
            <option value="Amsterdam"></option>
            <option value="Geneva"></option>
            <option value="Chamonix"></option>
          </datalist>
        </div>

        <div class="event__field-group event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input event__input--time"
            id="event-start-time-1" type="text" name="event-start-time"
            value="${start}">
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input event__input--time"
            id="event-end-time-1" type="text" name="event-end-time"
            value="${end}">
        </div>

        <div class="event__field-group event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
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
        <section class="event__section event__section--offers">
          <h3 class="event__section-title event__section-title--offers">Offers</h3>

          <div class="event__available-offers">
            ${offersTemplate}
          </div>
        </section>

        <section class="event__section event__section--destination">
          <h3 class="event__section-title event__section-title--destination">Destination</h3>
          <p class="event__destination-description">
            Description for ${destinationName}
          </p>
        </section>
      </section>
    </form>
  `;
}

export default class EditFormView extends AbstractView{
  #point = {};
  #allOffers = {};
  #destination = '';
  constructor({ point, allOffers, destination }) {
    super();
    this.#point = point;
    this.#allOffers = allOffers;
    this.#destination = destination;
  }

  get template() {
    return createEditFormTemplate(this.#point, this.#allOffers, this.#destination);
  }
}
