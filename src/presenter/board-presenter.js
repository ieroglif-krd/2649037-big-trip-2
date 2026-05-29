import { render } from '../framework/render.js';
import FilterView from '../view/filter-view.js';
import InfoView from '../view/info-view.js';
import SortView from '../view/sort-view.js';
import PointPresenter from './point-presenter';

export default class BoardPresenter {
  #infoContainer = {};
  #filterContainer = {};
  #sortContainer = {};
  #wayPointsModel = {};
  #points = {};

  constructor({ infoContainer, filterContainer, sortContainer, wayPointsModel }) {
    this.#infoContainer = infoContainer;
    this.#filterContainer = filterContainer;
    this.#sortContainer = sortContainer;
    this.#wayPointsModel = wayPointsModel;
  }

  init() {
    // Рендер информации о маршруте
    render(new InfoView(), this.#infoContainer, 'afterbegin');

    // Рендер фильтров
    render(new FilterView(), this.#filterContainer);

    // Рендер сортировки
    render(new SortView(), this.#sortContainer);

    this.#renderPointsList();
  }

  #renderPointsList() {

    // Создаём контейнер списка
    const listContainer = document.createElement('ul');
    listContainer.classList.add('trip-events__list');
    this.#sortContainer.append(listContainer);
    this.#points = this.#wayPointsModel.getPoints();

    this.#points.forEach((point) => {
      const presenter = new PointPresenter({pointsModel: this.#wayPointsModel, container: listContainer});
      presenter.init(
        point
      );
    });
  }
}
