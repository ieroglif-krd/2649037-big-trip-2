import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../const.js';

function createEmptyListTemplate(filter) {
  let message = '';

  switch (filter) {
    case FilterType.EVERYTHING:
      message = 'Click New Event to create your first point';
      break;

    case FilterType.PAST:
      message = 'There are no past events now';
      break;

    case FilterType.PRESENT:
      message = 'There are no present events now';
      break;

    case FilterType.FUTURE:
      message = 'There are no future events now';
      break;

    default:
      message = '';
  }

  return `
    <p class="trip-events__msg">${message}</p>
  `;
}

export default class EmptyList extends AbstractView {
  #filter = '';

  constructor (filter){
    super();
    this.#filter = filter;
  }

  get template() {
    return createEmptyListTemplate(this.#filter);
  }
}
