import BoardPresenter from './presenter/board-presenter.js';
import WayPointsModel from './model/points-model.js';

const infoElement = document.querySelector('.trip-main');
const filterElement = document.querySelector('.trip-controls__filters');
const sortElement = document.querySelector('.trip-events');

const wayPointsModel = new WayPointsModel();

const boardPresenter = new BoardPresenter({
  infoContainer: infoElement,
  filterContainer: filterElement,
  sortContainer: sortElement,
  wayPointsModel
});

boardPresenter.init();

