import { render, remove } from '../framework/render.js';
import FilterView from '../view/filter-view.js';
import InfoView from '../view/info-view.js';
import SortView from '../view/sort-view.js';
import EmptyList from '../view/empty-list-view.js';
import PointPresenter from './point-presenter.js';
import { FilterType, SortType, UpdateType, UserAction } from '../const.js';

export default class BoardPresenter {
  #infoContainer = {};
  #filterContainer = {};
  #boardContainer = {};
  #wayPointsModel = {};

  #currentFilter = FilterType.EVERYTHING;
  #currentSortType = SortType.DAY;
  #sortView = null;
  #listContainer = null;

  #pointPresenters = new Map();
  #message = null;

  constructor({ infoContainer, boardContainer, wayPointsModel }) {
    this.#infoContainer = infoContainer;
    this.#boardContainer = boardContainer;
    this.#filterContainer = this.#infoContainer.querySelector('.trip-controls__filters');
    this.#wayPointsModel = wayPointsModel;

    this.#wayPointsModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    const filteredPoints = this.#getFilteredPoints();
    const sortedPoints = [...filteredPoints];
    switch (this.#currentSortType) {
      case SortType.PRICE:
        return sortedPoints.sort((pointA, pointB) => pointB.basePrice - pointA.basePrice);

      case SortType.TIME:
        return sortedPoints.sort((pointA, pointB) => {
          const durationA = new Date(pointA.dateTo) - new Date(pointA.dateFrom);
          const durationB = new Date(pointB.dateTo) - new Date(pointB.dateFrom);
          return durationB - durationA;
        });

      default:
        return sortedPoints.sort((pointA, pointB) => new Date(pointA.dateFrom) - new Date(pointB.dateFrom));
    }
  }

  init() {

    // Рендер информации о маршруте
    render(new InfoView(), this.#infoContainer, 'afterbegin');

    // Рендер фильтров
    render(new FilterView({ onFilterChange: this.#handleFilterChange }), this.#filterContainer);


    this.#renderPointsList();
  }

  #getFilteredPoints() {
    const points = this.#wayPointsModel.points;
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

  #renderSortView() {
    this.#sortView = new SortView({ onSortChange: this.#handleSortChange });
    render(this.#sortView, this.#boardContainer, 'afterbegin');

  }

  #clearPointsList(resetSortType = false) {

    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    if (this.#message) {
      remove(this.#message);
      this.#message = null;
    }

    // удаляем контейнер со списком, если он есть
    if (this.#listContainer) {
      this.#listContainer.remove();
      this.#listContainer = null;
    }

    if (resetSortType) {
      remove(this.#sortView);
      this.#sortView = null;
      this.#currentSortType = SortType.DAY;
    }
  }

  #renderPointsList() {

    if (this.points.length !== 0) {

      // Рендер сортировки
      if(!this.#sortView) {
        this.#renderSortView();
      }

      // Создаём контейнер списка
      this.#listContainer = document.createElement('ul');
      this.#listContainer.classList.add('trip-events__list');
      this.#boardContainer.append(this.#listContainer);

      // Создаём точки
      this.points.forEach((point) => {
        const presenter = new PointPresenter({
          pointsModel: this.#wayPointsModel,
          container: this.#listContainer,
          onDataChange: this.#handleViewAction,
          onModeChange: this.#handleModeChange
        });
        presenter.init(point);
        this.#pointPresenters.set(point.id, presenter);
      });
    } else {
      this.#clearPointsList(true);
      this.#renderEmptyList();

    }
  }

  #renderEmptyList() {
    this.#message = new EmptyList(this.#currentFilter);
    render(this.#message, this.#boardContainer);
  }

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleFilterChange = (filterType) => {
    this.#currentFilter = filterType;
    this.#currentSortType = SortType.DAY;// сброс сортировки
    if (this.#sortView) {
      this.#sortView.reset();
    }
    this.#clearPointsList();
    this.#renderPointsList();
  };

  #handleSortChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clearPointsList();
    this.#renderPointsList();

  };

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#wayPointsModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this.#wayPointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this.#wayPointsModel.deletePoint(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    // В зависимости от типа изменений решаем, что делать:
    switch (updateType) {
      case UpdateType.PATCH:
        // - обновить часть списка (например, когда поменялось описание)
        this.#pointPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        // - обновить список (например, когда задача ушла в архив)
        this.#clearPointsList();
        this.#renderPointsList();
        break;
      case UpdateType.MAJOR:
        // - обновить всю доску (например, при переключении фильтра)
        this.#clearPointsList({ resetSortType: true });
        this.#renderPointsList();
        break;
    }
  };
}
