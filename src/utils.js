import { PRICE } from './const.js';

function getRandomNumber(min = PRICE.min, max = PRICE.max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomOffers(offers) {
  const maxOffers = offers.length;
  const checkedOffers = getRandomNumber(0, maxOffers);
  const result = new Set();
  while (result.size < checkedOffers) {
    const randomIndex = getRandomNumber(0, maxOffers - 1);
    const id = offers[randomIndex].id;
    if (!result.has(id)) {
      result.add(id);
    }

  }
  return [...result];

}

const isEsc = (evt) => evt.key === 'Escape';

function updateItem(items, update) {
  return items.map((item) => item.id === update.id ? update : item);
}

export { getRandomNumber, getRandomOffers, isEsc, updateItem };
