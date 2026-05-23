import { EVENTS_COUNT, DATA_DATES } from '../const.js';
import { getRandomNumber, getRandomOffers } from '../utils.js';
import { destinations } from './destination.js';
import { events } from './offers-data.js';


const lastDate = new Date(DATA_DATES.START);

//получаем пункт назначения
const destinationIds = destinations.map((d) => d.id);
const destinationCity = destinationIds[getRandomNumber(0, destinationIds.length - 1)];


//получаем предложения
const eventsTypes = events.map((t) => t.type);


const point = (index) => {
  // задаем начальную дату
  const dateFrom = new Date(lastDate);

  // находим длительность и время между событиями
  const durationHours = getRandomNumber(0, DATA_DATES.DURATION_HOURS);
  const dateTo = new Date(lastDate);
  dateTo.setHours(dateTo.getHours() + durationHours);

  // записываем начало следующего события.
  lastDate.setDate(dateTo.getDate() + getRandomNumber(0, DATA_DATES.GAP));

  //записываем все (пока что) предложения
  const eventType = eventsTypes[getRandomNumber(0, eventsTypes.length - 1)];
  const eventData = events.find((e) => e.type === eventType);
  return {
    id: index,
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
  for (let i = 0; i < EVENTS_COUNT; i++) {
    points.push(point(i));
  }
  return points;
};

export { createPoints };
