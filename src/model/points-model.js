
import Observable from '../framework/observable.js';
import { UpdateType } from '../const.js';

export default class WayPointsModel extends Observable {
  #wayPoints = [];
  #destinations = [];
  #offers = [];
  #pointApiService = null;

  constructor({ pointApiService }) {
    super();
    this.#pointApiService = pointApiService;
  }

  get points() {
    return this.#wayPoints;
  }

  get offers() {
    return this.#offers;
  }

  get destinations() {
    return this.#destinations;
  }


  async init() {
    try {
      const [points, offers, destinations] = await Promise.all([
        this.#pointApiService.points,
        this.#pointApiService.offers,
        this.#pointApiService.destinations
      ]);

      this.#wayPoints = points.map(this.#adaptToClient);
      this.#offers = offers;
      this.#destinations = destinations;
      this._notify(UpdateType.INIT);
    } catch (err) {
      this.#wayPoints = [];
      this.#offers = [];
      this.#destinations = [];
      this._notify(UpdateType.ERROR);
    }


  }

  async updatePoint(updateType, update) {
    const index = this.#wayPoints.findIndex((point) => point.id === update.id);

    if (!~index) {
      throw new Error('Can\'t update non-existing point');
    }

    try {
      const response = await this.#pointApiService.updatePoint(update);
      const updatedPoint = this.#adaptToClient(response);

      this.#wayPoints = [
        ...this.#wayPoints.slice(0, index),
        updatedPoint,
        ...this.#wayPoints.slice(index + 1),
      ];

      this._notify(updateType, updatedPoint);

    } catch (err) {
      throw new Error('Can\'t update point');
    }
  }

  async addPoint(updateType, update) {
    try {
      const response = await this.#pointApiService.addPoint(update);
      const newPoint = this.#adaptToClient(response);
      this.#wayPoints = [newPoint, ...this.#wayPoints];
      this._notify(updateType, newPoint);
    } catch (err) {
      throw new Error('Can\'t add point');
    }
  }

  async deletePoint(updateType, update) {
    const index = this.#wayPoints.findIndex((point) => point.id === update.id);

    if (!~index) {
      throw new Error('Can\'t delete unexacting point');
    }
    try {
      await this.#pointApiService.deletePoint(update);
      this.#wayPoints = [
        ...this.#wayPoints.slice(0, index),
        ...this.#wayPoints.slice(index + 1),
      ];
      this._notify(updateType);
    } catch (err) {
      throw new Error('Can\'t delete point');
    }
  }

  // находим все предложения для переданного типа.
  getEventByType(type) {
    return this.#offers.find((event) => event.type === type);
  }

  // находим название города по ID
  getDestination(point) {
    const destination = this.#destinations.find((currentDestination) => currentDestination.id === point.destination);
    return destination ? destination.name : '';
  }

  getOffersForPoint = (point) => {
    const eventType = this.getEventByType(point.type);

    return point.offers
      .map((offerId) => eventType.offers.find((offer) => offer.id === offerId))
      .filter(Boolean); // на случай, если id нет
  };

  getTripInfo() {
    if (this.#wayPoints.length === 0) {
      return {
        firstCity: '',
        lastCity: '',
        citiesCount: 0,
        startDate: null,
        endDate: null,
        totalCost: 0
      };
    }

    const sortedPoints = [...this.points].sort(
      (pointA, pointB) => new Date(pointA.dateFrom) - new Date(pointB.dateFrom)
    );

    // ГОРОДА
    const cities = sortedPoints.map((point) => {
      const destinationObject = this.#destinations.find(
        (destinationItem) => destinationItem.id === point.destination
      );
      return destinationObject ? destinationObject.name : '';
    });

    const firstCity = cities[0];
    const lastCity = cities[cities.length - 1];
    const citiesCount = cities.length;

    // ДАТЫ
    const startDate = new Date(sortedPoints[0].dateFrom);
    const endDate = new Date(sortedPoints[sortedPoints.length - 1].dateTo);

    // СТОИМОСТЬ
    let totalCost = 0;

    for (const point of sortedPoints) {
      totalCost += point.basePrice;
      const selectedOffers = this.getOffersForPoint(point);
      for (const offerItem of selectedOffers) {
        totalCost += offerItem.price;
      }
    }

    // ВОЗВРАЩАЕМ ЕДИНЫЙ ОБЪЕКТ
    return {
      firstCity,
      lastCity,
      citiesCount,
      startDate,
      endDate,
      totalCost
    };
  }

  #adaptToClient(point) {
    const adaptedPoint = {
      ...point,
      basePrice: point['base_price'],
      dateFrom: point['date_from'],
      dateTo: point['date_to'],
      destination: point['destination'], // ID
      isFavorite: point['is_favorite'],
      offers: point['offers'], // массив ID
    };

    delete adaptedPoint['base_price'];
    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['is_favorite'];

    return adaptedPoint;
  }
}

