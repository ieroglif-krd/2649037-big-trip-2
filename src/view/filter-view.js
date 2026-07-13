import AbstractView from '../framework/view/abstract-view.js';

function createFilterTemplate() {
  return (
    `
      <div class="trip-controls__filters">
        <h2 class="visually-hidden">Filter events</h2>
        <form class="trip-filters" action="#" method="get">

          <div class="trip-filters__filter">
            <input
              id="filter-everything"
              class="trip-filters__filter-input visually-hidden"
              type="radio"
              name="trip-filter"
              value="everything"
              checked
            >
            <label class="trip-filters__filter-label" for="filter-everything">Everything</label>
          </div>

          <div class="trip-filters__filter">
            <input
              id="filter-future"
              class="trip-filters__filter-input visually-hidden"
              type="radio"
              name="trip-filter"
              value="future"
            >
            <label class="trip-filters__filter-label" for="filter-future">Future</label>
          </div>

          <div class="trip-filters__filter">
            <input
              id="filter-present"
              class="trip-filters__filter-input visually-hidden"
              type="radio"
              name="trip-filter"
              value="present"
            >
            <label class="trip-filters__filter-label" for="filter-present">Present</label>
          </div>

          <div class="trip-filters__filter">
            <input
              id="filter-past"
              class="trip-filters__filter-input visually-hidden"
              type="radio"
              name="trip-filter"
              value="past"
            >
            <label class="trip-filters__filter-label" for="filter-past">Past</label>
          </div>

          <button class="visually-hidden" type="submit">Accept filter</button>
        </form>
      </div>
    `
  );
}

export default class FilterView extends AbstractView {
  #handleFilterChange = null;
  #filtersAvailability = null;

  constructor({ onFilterChange, filtersAvailability }) {
    super();

    this.#handleFilterChange = onFilterChange;
    this.#filtersAvailability = filtersAvailability;

    this.element.addEventListener('change', this.#onFilterChangeHandler);
  }

  get template() {
    return createFilterTemplate();
  }

  reset() {
    const everythingInput = this.element.querySelector('#filter-everything');
    everythingInput.checked = true;
  }


  updateDisabled(filtersAvailability) {
    this.#filtersAvailability = filtersAvailability;

    this.element.querySelector('#filter-everything').disabled = !filtersAvailability.everything;
    this.element.querySelector('#filter-future').disabled = !filtersAvailability.future;
    this.element.querySelector('#filter-present').disabled = !filtersAvailability.present;
    this.element.querySelector('#filter-past').disabled = !filtersAvailability.past;
  }

  #onFilterChangeHandler = (evt) => {
    if (evt.target.name === 'trip-filter') {
      this.#handleFilterChange(evt.target.value);
    }
  };
}
