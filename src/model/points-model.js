import { createPoints } from '../mocks/points-data.js';
import { events } from '../mocks/offers-data.js';
import { destinations } from '../mocks/destination.js';


export default class WayPointsModel {
  wayPoints = createPoints();

  getPoints() {
    return this.wayPoints;
  }

  // находим все предложения для переданного типа.
  getEventByType(type) {
    return events.find((e) => e.type === type);
  }

  // находим название города по ID
  getDestination (point){
    const destination = destinations.find((d) => d.id === point.destination);
    return destination ? destination.name : '';
  }

  getEvents() {
    return events;
  }

  getDestinations() {
    return destinations;
  }

  getOffersForPoint = (point) => {
    const eventData = this.getEventByType(point.type);

    return point.offers
      .map((offerId) => eventData.offers.find((o) => o.id === offerId))
      .filter(Boolean); // на случай, если id нет
  };

}

