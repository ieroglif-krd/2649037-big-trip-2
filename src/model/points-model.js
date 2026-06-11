import { createPoints } from '../mocks/points-data.js';
import { events } from '../mocks/offers-data.js';
import { destinations } from '../mocks/destination.js';
import Observable from '../framework/observable.js';


export default class WayPointsModel extends Observable {
  wayPoints = createPoints();

  get points() {
    return this.wayPoints;
  }

  // находим все предложения для переданного типа.
  getEventByType(type) {
    return events.find((event) => event.type === type);
  }

  // находим название города по ID
  getDestination (point){
    const destination = destinations.find((currentDestination) => currentDestination.id === point.destination);
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
      .map((offerId) => eventData.offers.find((offer) => offer.id === offerId))
      .filter(Boolean); // на случай, если id нет
  };

}

