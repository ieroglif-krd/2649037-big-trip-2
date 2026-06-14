const PRICE = {
  min: 1000,
  max: 5000
};

const DATA_DATES = {
  START : '2026-05-01T00:00:00.000Z',
  END : '2026-08-01T00:00:00.000Z',
  DURATION_HOURS: 30,
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

const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT',
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
};

export {PRICE, POINTS_COUNT, DATA_DATES, FilterType, SortType, UserAction, UpdateType};
