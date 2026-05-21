const events = [
  {
    type: 'taxi',
    offers: [
      { id: 1, title: 'Бизнес‑класс такси', price: 120 },
      { id: 2, title: 'Встреча у выхода из терминала', price: 40 },
      { id: 3, title: 'Дополнительный багаж', price: 25 }
    ]
  },
  {
    type: 'bus',
    offers: [
      { id: 4, title: 'Место у окна', price: 10 },
      { id: 5, title: 'Дополнительное место для ног', price: 15 }
    ]
  },
  {
    type: 'train',
    offers: [
      { id: 6, title: 'Переход в первый класс', price: 90 },
      { id: 7, title: 'Горячее питание в пути', price: 25 },
      { id: 8, title: 'Выбор нижней полки', price: 12 }
    ]
  },
  {
    type: 'ship',
    offers: [
      { id: 9, title: 'Каюта с видом на море', price: 150 },
      { id: 10, title: 'Шведский стол на борту', price: 60 },
      { id: 11, title: 'Приоритетная посадка', price: 35 }
    ]
  },
  {
    type: 'drive',
    offers: [
      { id: 12, title: 'Полная страховка автомобиля', price: 80 },
      { id: 13, title: 'Навигатор в аренду', price: 20 },
      { id: 14, title: 'Детское кресло', price: 15 }
    ]
  },
  {
    type: 'flight',
    offers: [
      { id: 15, title: 'Дополнительный багаж', price: 50 },
      { id: 16, title: 'Выбор места в салоне', price: 30 },
      { id: 17, title: 'Питание премиум‑класса', price: 45 },
      { id: 18, title: 'Приоритетная регистрация', price: 35 }
    ]
  },
  {
    type: 'check-in',
    offers: [
      { id: 19, title: 'Ранний заезд', price: 40 },
      { id: 20, title: 'Поздний выезд', price: 45 }
    ]
  },
  {
    type: 'sightseeing',
    offers: [
      { id: 21, title: 'Личный гид', price: 100 },
      { id: 22, title: 'Аудиогид', price: 15 },
      { id: 23, title: 'Приоритетный вход без очереди', price: 35 }
    ]
  },
  {
    type: 'restaurant',
    offers: [
      { id: 24, title: 'Столик у окна', price: 20 },
      { id: 25, title: 'Дегустационное меню', price: 55 },
      { id: 26, title: 'Праздничное оформление стола', price: 30 }
    ]
  }
];

export {events};
