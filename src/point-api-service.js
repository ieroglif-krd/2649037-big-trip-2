import ApiService from './framework/api-service.js';

const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE'
};

const URL_LOADS = {
  POINTS :  'points',
  DESTINATIONS : 'destinations',
  OFFERS: 'offers'
};

const HEADERS = { 'Content-Type': 'application/json' };

export default class PointApiService extends ApiService {
  get points() {
    return this._load({ url: URL_LOADS.POINTS})
      .then(ApiService.parseResponse);
  }

  get destinations() {
    return this._load({ url: URL_LOADS.DESTINATIONS })
      .then(ApiService.parseResponse);
  }

  get offers() {
    return this._load({ url: URL_LOADS.OFFERS })
      .then(ApiService.parseResponse);
  }

  async updatePoint(point) {
    const response = await this._load({
      url: `points/${point.id}`,
      method: Method.PUT,
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers(HEADERS),
    });

    const parsedResponse = await ApiService.parseResponse(response);

    return parsedResponse;
  }

  async addPoint(point) {
    const response = await this._load({
      url: 'points',
      method: Method.POST,
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers(HEADERS),
    });

    const parsedResponse = await ApiService.parseResponse(response);

    return parsedResponse;
  }

  async deletePoint(point) {
    const response = await this._load({
      url: `points/${point.id}`,
      method: Method.DELETE,
    });

    return response;
  }

  #adaptToServer(point) {
    const adaptedPoint = {
      ...point,
      'base_price': point.basePrice,
      'date_from': point.dateFrom instanceof Date ? point.dateFrom.toISOString() : point.dateFrom,
      'date_to': point.dateTo instanceof Date ? point.dateTo.toISOString() : point.dateTo,
      'is_favorite': point.isFavorite,
      'destination': point.destination,
      'offers': point.offers.map((offer) => typeof offer === 'object' ? offer.id : offer),
      'type': point.type,
    };

    // Удаляем клиентские camelCase-поля
    delete adaptedPoint.basePrice;
    delete adaptedPoint.dateFrom;
    delete adaptedPoint.dateTo;
    delete adaptedPoint.isFavorite;

    return adaptedPoint;
  }

}
