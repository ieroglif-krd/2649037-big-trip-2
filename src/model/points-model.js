import { createPoints } from '../mocks/points-data.js';

export default class WayPointsModel {
  wayPoints = createPoints();

  getPoints() {
    return this.wayPoints;
  }
}

