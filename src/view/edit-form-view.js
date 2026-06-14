import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import dayjs from 'dayjs';
import flatpickr from 'flatpickr';

import 'flatpickr/dist/flatpickr.min.css';

function createEditFormTemplate(point, allOffers, destinationsList) {
  const {
    type,
    dateFrom,
    dateTo,
    basePrice,
    offers: selectedOfferIds,
    destination: destinationId
  } = point;

  // Находим объект destination по ID
  const destination = destinationsList.find((d) => d.id === destinationId);
  const {
    name: destinationName = '',
    description: destinationDescription = '',
    pictures: destinationPictures = []
  } = destination || {};

  const destinationSection = destinationDescription
    ? `
    <section class="event__section event__section--destination">
      <h3 class="event__section-title event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${destinationDescription}</p>
    </section>
  `
    : '';

  const destinationPhotosSection = createPhotosTemplate();

  // Форматирование дат
  const formatForInput = (date) => dayjs(date).format('DD/MM/YY HH:mm');
  const start = formatForInput(dateFrom);
  const end = formatForInput(dateTo);

  // Генерация списка услуг
  const eventForType = allOffers.find((offer) => offer.type === type);
  const offersForType = eventForType ? eventForType.offers : [];
  const offersTemplate = offersForType.map((offer) => {
    const isChecked = selectedOfferIds.includes(offer.id);

    return `
      <div class="event__offer-selector">
        <input
          class="event__offer-checkbox visually-hidden"
          id="event-offer-${offer.id}"
          type="checkbox",
          data-offer-id="${offer.id}"
          ${isChecked ? 'checked' : ''}
        >
        <label class="event__offer-label" for="event-offer-${offer.id}">
          <span class="event__offer-title">${offer.title}</span>
          &plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
        </label>
      </div>
    `;
  }).join('');

  // Генерация списка городов
  const destinationsOptions = destinationsList
    .map((currentDestination) => `<option value="${currentDestination.name}"></option>`)
    .join('');

  // Генерация фотографий
  function createPhotosTemplate() {
    if (!destinationPictures || destinationPictures.length === 0) {
      return '';
    }

    const photosMarkup = destinationPictures
      .map((photo) => `<img class="event__photo" src="${photo.src}" alt="${photo.description}">`)
      .join('');

    return `
    <div class="event__photos-container">
      <div class="event__photos-tape">
        ${photosMarkup}
      </div>
    </div>
  `;
  }

  return `
    <form class="event event--edit" action="#" method="post" autocomplete="off">
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

              ${['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'].map((typeName) => `
                  <div class="event__type-item">
                    <input id="event-type-${typeName}-1"
                      class="event__type-input visually-hidden"
                      type="radio" name="event-type" value="${typeName}"
                      ${typeName === type ? 'checked' : ''}>
                    <label class="event__type-label event__type-label--${typeName}"
                      for="event-type-${typeName}-1">${typeName[0].toUpperCase() + typeName.slice(1)}</label>
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

        ${destinationSection}
        ${destinationPhotosSection}
      </section>
    </form>
  `;
}


export default class EditFormView extends AbstractStatefulView {
  #allOffers;
  #destinationsList;
  #handlerFormSubmit;
  #handlerRollupClick;
  #startDatepicker = null;
  #endDatepicker = null;
  #handleDeleteClick = null;
  #listContainer = null;

  constructor({ point, offers, destinationsList, onFormSubmit, onRollupClick, onDeleteClick }) {
    super();
    this._setState(EditFormView.parsePointToState(point));
    this.#allOffers = offers;
    this.#destinationsList = destinationsList;
    this.#handlerFormSubmit = onFormSubmit;
    this.#handlerRollupClick = onRollupClick;
    this.#handleDeleteClick = onDeleteClick;

    this._restoreHandlers();

  }

  get template() {
    return createEditFormTemplate(
      this._state,
      this.#allOffers,
      this.#destinationsList
    );
  }

  _restoreHandlers() {
    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#onRollupClickHandler);
    this.element.addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__type-list')
      .addEventListener('change', this.#eventTypeChangeHandler);
    this.element.querySelector('.event__input--destination')
      .addEventListener('input', this.#destinationChangeHandler);
    this.element.querySelector('.event__reset-btn')
      .addEventListener('click', this.#formDeleteHandler);
    this.element.querySelector('.event__input--price')
      .addEventListener('input', this.#priceInputHandler);
    this.element.querySelector('.event__available-offers')
      .addEventListener('change', this.#offersChangeHandler);

    this.#initDatepickers();
  }

  reset(point) {
    this.updateElement(
      EditFormView.parsePointToState(point)
    );
  }

  #getDestinationIdByName(name) {
    const found = this.#destinationsList.find((d) => d.name === name);
    return found ? found.id : null;
  }

  #initDatepickers() {
    if (this.#startDatepicker) {
      this.#startDatepicker.destroy();
    }
    if (this.#endDatepicker) {
      this.#endDatepicker.destroy();
    }
    const startInput = this.element.querySelector('#event-start-time-1');
    const endInput = this.element.querySelector('#event-end-time-1');

    this.#startDatepicker = flatpickr(startInput, {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: this._state.dateFrom,
      maxDate: this._state.dateTo,
      onChange: ([selectedDate]) => {
        this._setState({ dateFrom: selectedDate });

        // Если начало > конец → двигаем конец
        if (selectedDate > this._state.dateTo) {
          this._setState({ dateTo: selectedDate });
          this.#endDatepicker.setDate(selectedDate);
        }

        // Обновляем ограничения
        this.#endDatepicker.set('minDate', selectedDate);
      }
    });

    this.#endDatepicker = flatpickr(endInput, {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: this._state.dateTo,
      minDate: this._state.dateFrom,
      onChange: ([selectedDate]) => {
        this._setState({ dateTo: selectedDate });

        // Если конец < начало → двигаем начало
        if (selectedDate < this._state.dateFrom) {
          this._setState({ dateFrom: selectedDate });
          this.#startDatepicker.setDate(selectedDate);
        }

        // Обновляем ограничения
        this.#startDatepicker.set('maxDate', selectedDate);
      }
    });
  }

  #onRollupClickHandler = (evt) => {
    evt.preventDefault();
    this.#handlerRollupClick();
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handlerFormSubmit(EditFormView.parseStateToPoint(this._state));
  };

  #eventTypeChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      type: evt.target.value
    });

  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const name = evt.target.value;
    const found = this.#destinationsList.find((d) => d.name === name);

    if (found) {
      // сохраняем селектор активного элемента
      const selector = '.event__input--destination';

      // перерисовываем форму
      this.updateElement({
        destination: found.id
      });

      // возвращаем фокус
      this.element.querySelector(selector).focus();
    }
  };

  #priceInputHandler = (evt) => {
    // Удаляем всё, что не цифры
    evt.target.value = evt.target.value.replace(/\D/g, '');
    const price = evt.target.value;
    this._setState({
      basePrice: isNaN(price) ? 0 : price
    });
  };

  #formDeleteHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(EditFormView.parseStateToPoint(this._state));
  };

  #offersChangeHandler = (evt) => {
    const checkbox = evt.target;

    if (checkbox.classList.contains('event__offer-checkbox')) {
      const offerId = Number(checkbox.dataset.offerId);
      const isChecked = checkbox.checked;

      let updatedOffers;

      if (isChecked) {
        updatedOffers = [...this._state.offers, offerId];
      } else {
        updatedOffers = this._state.offers.filter((id) => id !== offerId);
      }

      this._setState({ offers: updatedOffers });
    }
  };

  static parsePointToState(point) {
    return { ...point };
  }

  static parseStateToPoint(state) {
    return { ...state };
  }


}
