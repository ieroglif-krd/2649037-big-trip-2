import { render, remove } from '../framework/render.js';
import FilterView from '../view/filter-view.js';
import InfoView from '../view/info-view.js';
import SortView from '../view/sort-view.js';
import EmptyList from '../view/list-empty-view.js';
import PointPresenter from './point-presenter.js';
import { FilterType, SortType } from '../const.js';


export default class BoardPresenter {
  #infoContainer = {};
  #filterContainer = {};
  #sortContainer = {};
  #wayPointsModel = {};
  #points = [];
  #currentFilter = FilterType.EVERYTHING;
  #currentSort = SortType.DAY;
  #pointPresenters = new Map();
  #message = null;

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
    render(
      new FilterView({
        onFilterChange: this.#handleFilterChange
      }),
      this.#filterContainer
    );

    // Рендер сортировки
    render(
      new SortView({
        onSortChange: this.#handleSortChange
      }), this.#sortContainer);

    this.#renderPointsList();
  }

  #handleFilterChange = (filterType) => {
    this.#currentFilter = filterType;
    this.#currentSort = SortType.DAY; // сброс сортировки
    this.#clearPointsList();
    this.#renderPointsList();
  };

  #handleSortChange = (sortType) => {
    this.#currentSort = sortType;
    this.#clearPointsList();
    this.#renderPointsList();
  };

  #getFilteredPoints() {
    const points = this.#wayPointsModel.getPoints();
    const now = new Date();

    switch (this.#currentFilter) {
      case FilterType.FUTURE:
        return points.filter((point) => new Date(point.dateFrom) > now);

      case FilterType.PRESENT:
        return points.filter((point) =>
          new Date(point.dateFrom) <= now && new Date(point.dateTo) >= now
        );

      case FilterType.PAST:
        return points.filter((point) => new Date(point.dateTo) < now);

      default:
        return points;
    }
  }

  #getSortedPoints(points) {
    switch (this.#currentSort) {
      case SortType.PRICE:
        return [...points].sort((pointA, pointB) => pointB.basePrice - pointA.basePrice);

      case SortType.TIME:
        return [...points].sort((pointA, pointB) => {
          const durationA = new Date(pointA.dateTo) - new Date(pointA.dateFrom);
          const durationB = new Date(pointB.dateTo) - new Date(pointB.dateFrom);
          return durationB - durationA;
        });

      default: // DAY
        return [...points].sort((pointA, pointB) => new Date(pointA.dateFrom) - new Date(pointB.dateFrom));
    }
  }

  #clearPointsList() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
    if (this.message) {
      remove(this.message);
    }
  }

  #renderPointsList() {
    const filteredPoints = this.#getFilteredPoints();

    if(filteredPoints.length > 0){

      // Создаём контейнер списка
      const listContainer = document.createElement('ul');
      listContainer.classList.add('trip-events__list');
      this.#sortContainer.append(listContainer);

      // Создаём точки
      this.#points = this.#getSortedPoints(filteredPoints);
      this.#points.forEach((point) => {
        const presenter = new PointPresenter({ pointsModel: this.#wayPointsModel, container: listContainer });
        presenter.init(
          point
        );
        this.#pointPresenters.set(point.id, presenter);
      });
    } else {
      this.message = new EmptyList(this.#currentFilter);
      render (this.message, this.#sortContainer);
    }
  }
}
