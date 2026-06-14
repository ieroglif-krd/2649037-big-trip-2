import { createPoints } from '../mocks/points-data.js';
import { events } from '../mocks/offers-data.js';
import { destinations } from '../mocks/destination.js';
import Observable from '../framework/observable.js';


export default class WayPointsModel extends Observable {
  #wayPoints = createPoints();

  get points() {
    return this.#wayPoints;
  }

  get events() {
    return events;
  }

  get destinations() {
    return destinations;
  }

  updatePoint(updateType, update) {
    const index = this.#wayPoints.findIndex((point) => point.id === update.id);

    if (!~index) {
      throw new Error('Can\'t update unexacting point');
    }

    this.#wayPoints = [
      ...this.#wayPoints.slice(0, index),
      update,
      ...this.#wayPoints.slice(index + 1),
    ];

    this._notify(updateType, update);
  }

  addPoint(updateType, update) {
    this.#wayPoints = [
      update,
      ...this.#wayPoints,
    ];

    this._notify(updateType, update);
  }

  deletePoint(updateType, update) {
    const index = this.#wayPoints.findIndex((point) => point.id === update.id);

    if (!~index) {
      throw new Error('Can\'t delete unexacting point');
    }

    this.#wayPoints = [
      ...this.#wayPoints.slice(0, index),
      ...this.#wayPoints.slice(index + 1),
    ];

    this._notify(updateType);
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


  getOffersForPoint = (point) => {
    const eventType = this.getEventByType(point.type);

    return point.offers
      .map((offerId) => eventType.offers.find((offer) => offer.id === offerId))
      .filter(Boolean); // на случай, если id нет
  };

}

