import { render } from '../render.js';
import FilterView from '../view/filter-view.js';
import InfoView from '../view/info-view.js';
import SortView from '../view/sort-view.js';
import EditFormView from '../view/edit-form-view.js';
import PointView from '../view/point-view.js';

const RANDOM_POINT = 0;

export default class BoardPresenter {

  constructor({ infoContainer, filterContainer, sortContainer, wayPointsModel }) {
    this.infoContainer = infoContainer;
    this.filterContainer = filterContainer;
    this.sortContainer = sortContainer;
    this.wayPointsModel = wayPointsModel;
  }

  init() {
    // Рендер информации о маршруте
    render(new InfoView(), this.infoContainer, 'afterbegin');

    // Рендер фильтров
    render(new FilterView(), this.filterContainer);

    // Рендер сортировки
    render(new SortView(), this.sortContainer);

    // Создаём контейнер списка
    const listContainer = document.createElement('ul');
    listContainer.classList.add('trip-events__list');
    this.sortContainer.append(listContainer);

    this.points = this.wayPointsModel.getPoints();
    // Форма редактирования — первая в списке
    render(new EditFormView({ point: this.points[RANDOM_POINT] }), listContainer);

    // Создаем точки маршрута

    for (let i = 0; i < this.points.length; i++) {
      render(new PointView({ point: this.points[i] }), listContainer);
    }


  }
}
