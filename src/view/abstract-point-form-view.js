import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import dayjs from 'dayjs';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default class AbstractPointFormView extends AbstractStatefulView {
  #startDatepicker = null;
  #endDatepicker = null;

  // Общие утилиты
  _getDestinationIdByName(name, list) {
    return list.find((destination) => destination.name === name)?.id || null;
  }

  // Общий reset
  reset(point) {
    this.updateElement(AbstractPointFormView.parsePointToState(point));
  }

  // Общий календарь
  _initDatepickers(startSelector, endSelector, state, onStart, onEnd) {
    if (this.#startDatepicker) {
      this.#startDatepicker.destroy();
    }
    if (this.#endDatepicker) {
      this.#endDatepicker.destroy();
    }

    const startInput = this.element.querySelector(startSelector);
    const endInput = this.element.querySelector(endSelector);

    this.#startDatepicker = flatpickr(startInput, {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: state.dateFrom,
      minDate: 'today',
      onChange: ([date]) => {
        onStart(date);
        this._validateForm();
        this.#endDatepicker.set('minDate', date);// обновляем ограничение конца
        if (this._state.dateTo < date) {
          // если конец уже раньше старта — двигаем конец
          const newEnd = date;
          onEnd(newEnd);
          this.#endDatepicker.setDate(newEnd, false);
        }
      }
    });

    this.#endDatepicker = flatpickr(endInput, {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: state.dateTo,
      minDate: state.dateFrom,
      onChange: ([date]) => {
        onEnd(date);
        this._validateForm();
      }
    });
  }

  _formatDate(date) {
    return dayjs(date).format('DD/MM/YY HH:mm');
  }

  // Общие обработчики
  _handleTypeChange(evt) {
    evt.preventDefault();
    this.updateElement({ type: evt.target.value });
  }

  _handleOffersChange() {
    const offersChecked = document.querySelectorAll('.event__offer-checkbox:checked');
    this._setState({ offers: [...offersChecked]?.map((offer) => offer.value) });
  }

  _handleDestinationChange(evt, destinationsList) {
    const name = evt.target.value.trim();

    // Ищем ID по имени
    const destinationId = this._getDestinationIdByName(name, destinationsList);

    // Если город не найден — валидируем форму
    if (destinationId === null) {
      this._setState({ destination: null });
      this._validateForm();
      return;
    }

    // Если найден — обновляем форму
    this.updateElement({ destination: destinationId });
  }


  _handlePriceChange(evt) {
    // Удаляем всё, что не цифры
    evt.target.value = evt.target.value.replace(/\D/g, '');

    // Преобразуем в число
    const price = Number(evt.target.value);

    this._setState({
      basePrice: price
    });
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

  _validateForm() {
    const saveButton = this.element.querySelector('.event__save-btn');

    const { destination, dateFrom, dateTo, basePrice } = this._state;

    const isValid =
      destination !== null &&
      dateFrom !== null &&
      dateTo !== null &&
      Number(basePrice) > 0;

    saveButton.disabled = !isValid;
  }

  // Общий парсинг
  static parsePointToState(point) {
    return { ...point };
  }

  static parseStateToPoint(state) {
    return { ...state };
  }
}
