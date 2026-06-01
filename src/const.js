const PRICE = {
  min: 1000,
  max: 5000
};

const DATA_DATES = {
  START : '2026-05-01T00:00:00.000Z',
  END : '2026-08-01T00:00:00.000Z',
  DURATION_HOURS: 24,
  MIN_GAP: 7,
  MAX_GAP: 21
};

const POINTS_COUNT = 7;


const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past'
};

const SortType = {
  DAY: 'sort-day',
  PRICE: 'sort-price',
  TIME: 'sort-time'
};

export {PRICE, POINTS_COUNT, DATA_DATES, FilterType, SortType };
