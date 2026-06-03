import { POINTS_COUNT, DATA_DATES } from '../const.js';
import { getRandomNumber, getRandomOffers } from '../utils.js';
import { destinations } from './destination.js';
import { events } from './offers-data.js';
import { nanoid } from 'nanoid';


const lastDate = new Date(DATA_DATES.START);

//получаем предложения
const eventsTypes = events.map((event) => event.type);

const point = () => {
  // задаем начальную дату
  const dateFrom = new Date(lastDate);

  // находим длительность и время между событиями
  const durationHours = getRandomNumber(0, DATA_DATES.DURATION_HOURS);
  const dateTo = new Date(lastDate);
  dateTo.setHours(dateTo.getHours() + durationHours);

  // записываем начало следующего события.
  lastDate.setDate(dateTo.getDate() + getRandomNumber(DATA_DATES.MIN_GAP, DATA_DATES.MAX_GAP));

  //получаем пункт назначения
  const destinationIds = destinations.map((destination) => destination.id);
  const destinationCity = destinationIds[getRandomNumber(0, destinationIds.length - 1)];

  //записываем предложения
  const eventType = eventsTypes[getRandomNumber(0, eventsTypes.length - 1)];
  const eventData = events.find((event) => event.type === eventType);

  return {
    id: nanoid(),
    basePrice: getRandomNumber(),
    dateFrom: dateFrom.toISOString(),
    dateTo: dateTo.toISOString(),
    destination: destinationCity,
    isFavorite: Boolean(Math.round(Math.random())),
    offers: getRandomOffers(eventData.offers),
    type: eventType
  };
};

const createPoints = () => {
  const points = [];
  for (let i = 0; i < POINTS_COUNT; i++) {
    points.push(point());
  }
  return points;
};

export { createPoints };
