import { render, remove } from '../framework/render.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EmptyListView from '../view/empty-list-view.js';
import LoadingView from '../view/loading-view.js';
import FailedLoadDataView from '../view/failed-load-data-view.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import { FilterType, SortType, UpdateType, UserAction, TimeLimit } from '../const.js';

export default class BoardPresenter {
  #infoContainer = {};
  #filterContainer = {};
  #boardContainer = {};
  #wayPointsModel = {};

  #currentFilter = FilterType.EVERYTHING;
  #currentSortType = SortType.DAY;
  #loadingComponent = new LoadingView();
  #errorComponent = null;
  #sortView = null;
  #filterView = null;
  #listContainer = null;

  #pointPresenters = new Map();
  #newEventButton = null;
  #newPointPresenter = null;

  #message = null;

  #isLoading = true;

  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

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
    // Кнопка "New event"
    this.#newEventButton = this.#infoContainer.querySelector('.trip-main__event-add-btn');

    this.#newEventButton.addEventListener('click', this.#onNewEventButtonClick);


    // Рендер фильтров
    const filtersAvailability = this.#getFiltersAvailability();

    this.#filterView = new FilterView({
      onFilterChange: this.#handleFilterChange,
      filtersAvailability
    });

    render(this.#filterView, this.#filterContainer);
    //this.#filterView.updateDisabled(filtersAvailability);

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

  #getFiltersAvailability() {
    const points = this.#wayPointsModel.points;
    const now = new Date();

    return {
      [FilterType.EVERYTHING]: points.length > 0,

      [FilterType.FUTURE]: points.some((pointItem) => {
        const pointDateFrom = new Date(pointItem.dateFrom);
        return pointDateFrom > now;
      }),

      [FilterType.PRESENT]: points.some((pointItem) => {
        const pointDateFrom = new Date(pointItem.dateFrom);
        const pointDateTo = new Date(pointItem.dateTo);
        return pointDateFrom <= now && pointDateTo >= now;
      }),

      [FilterType.PAST]: points.some((pointItem) => {
        const pointDateTo = new Date(pointItem.dateTo);
        return pointDateTo < now;
      })
    };
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

    if (this.#newPointPresenter !== null) {
      this.#destroyNewPointForm();
    }

    if (resetSortType) {
      remove(this.#sortView);
      this.#sortView = null;
      this.#currentSortType = SortType.DAY;
    }
    if (this.#loadingComponent) {
      remove(this.#loadingComponent);
    }

  }

  #renderPointsList() {

    if (this.points.length !== 0) {

      // Рендер сортировки
      if (!this.#sortView) {
        this.#renderSortView();
      }

      this.#createListContainer();

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
      this.#clearPointsList();
      this.#renderEmptyList();

    }
  }

  #renderEmptyList() {
    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }
    // Если ошибка — не показываем "нет точек"
    if (this.#errorComponent !== null) {
      return;
    }

    this.#message = new EmptyListView(this.#currentFilter);
    render(this.#message, this.#boardContainer);
  }

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());

    if (this.#newPointPresenter !== null) {
      this.#destroyNewPointForm();
    }
  };

  #handleFilterChange = (filterType) => {
    this.#currentFilter = filterType;
    this.#currentSortType = SortType.DAY;// сброс сортировки
    if (this.#sortView) {
      this.#sortView.reset();
    }
    this.#clearPointsList();
    this.#renderPointsList();
    this.#filterView.updateDisabled(this.#getFiltersAvailability());
  };


  #handleSortChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clearPointsList();
    this.#renderPointsList();

  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();

    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointPresenters.get(update.id).setSaving();
        try {
          await this.#wayPointsModel.updatePoint(updateType, update);
        } catch {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;

      case UserAction.ADD_POINT:
        this.#newPointPresenter.setSaving();
        try {
          await this.#wayPointsModel.addPoint(updateType, update);
        } catch {
          this.#newPointPresenter.setAborting();
        }
        break;

      case UserAction.DELETE_POINT:
        this.#pointPresenters.get(update.id).setDeleting();
        try {
          await this.#wayPointsModel.deletePoint(updateType, update);
        } catch {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
    }

    this.#uiBlocker.unblock();
  };

  #handleModelEvent = (updateType, data) => {
    // В зависимости от типа изменений решаем, что делать:
    switch (updateType) {
      case UpdateType.PATCH:
        // - обновить часть списка
        this.#pointPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        // - обновить список
        this.#clearPointsList();

        this.#filterView.updateDisabled(this.#getFiltersAvailability());
        this.#renderPointsList();
        break;
      case UpdateType.MAJOR:
        // - обновить всю доску
        this.#clearPointsList(true);
        this.#renderPointsList();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#filterView.updateDisabled(this.#getFiltersAvailability());
        this.#renderPointsList();
        break;
      case UpdateType.ERROR:
        this.#isLoading = false;
        // Удаляем загрузчик, если он был
        remove(this.#loadingComponent);
        // Полностью очищаем доску
        this.#clearPointsList(true);
        // Отключаем кнопку "New event"
        if (this.#newEventButton) {
          this.#newEventButton.disabled = true;
        }
        // Все фильтры делаем недоступными
        if (this.#filterView) {
          this.#filterView.updateDisabled({
            [FilterType.EVERYTHING]: false,
            [FilterType.FUTURE]: false,
            [FilterType.PRESENT]: false,
            [FilterType.PAST]: false
          });
        }
        // Показываем ошибку
        this.#errorComponent = new FailedLoadDataView();
        render(this.#errorComponent, this.#boardContainer);
        break;
    }
  };

  #newPointClickHandler = () => {
    // 1. Закрываем ВСЕ формы редактирования
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
    // 2. Сброс фильтра и сортировки
    if (this.#sortView) {
      this.#sortView.reset();
    }
    this.#filterView.reset();
    this.#filterView.updateDisabled(this.#getFiltersAvailability());
    // Удаляем EmptyList, если он есть
    if (this.#message) {
      remove(this.#message);
      this.#message = null;
    }
    // 3. Создание списка, если его нет
    this.#createListContainer();
    // 4. Создание формы новой точки
    this.#newPointPresenter = new NewPointPresenter({
      container: this.#listContainer,
      offers: this.#wayPointsModel.offers,
      destinations: this.#wayPointsModel.destinations,
      onSubmit: this.#handleNewPointSubmit,
      onCancel: this.#handleNewPointCancel
    });
    this.#newPointPresenter.init();
    //5. Отключаем кнопку "New event", чтобы нельзя было открыть две формы одновременно
    this.#newEventButton.disabled = true;
  };

  #handleNewPointSubmit = (newPoint) => {
    this.#handleViewAction(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      newPoint
    );

  };

  #handleNewPointCancel = () => {
    this.#destroyNewPointForm();
  };

  #destroyNewPointForm() {
    if (this.#newPointPresenter === null) {
      return;
    }
    this.#newPointPresenter.destroy();
    this.#newPointPresenter = null;
    this.#newEventButton.disabled = false;
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#boardContainer, 'afterbegin');
  }

  #createListContainer() {
    if (!this.#listContainer) {
      this.#listContainer = document.createElement('ul');
      this.#listContainer.classList.add('trip-events__list');
      this.#boardContainer.append(this.#listContainer);
    }
  }

  #onNewEventButtonClick = () => {
    this.#newPointClickHandler();
  };
}
