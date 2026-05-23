import { createPoints } from '../mocks/points-data.js';
import { events } from '../mocks/offers-data.js';

export default class WayPointsModel {
  wayPoints = createPoints();

  getPoints() {
    return this.wayPoints;
  }

  // находим все предложения для переданного типа.
  getEventByType(type) {
    return events.find((e) => e.type === type);
  }
}

