const events = [
  {
    type: 'taxi',
    offers: [
      { id: 1, title: 'Бизнес‑класс такси', price: 120 },
      { id: 2, title: 'Встреча у выхода из терминала', price: 40 },
      { id: 3, title: 'Дополнительный багаж', price: 25 },
      { id: 4, title: 'Вода в салоне', price: 5 },
      { id: 5, title: 'Тихий водитель', price: 0 },
      { id: 6, title: 'Ожидание 30 минут', price: 15 }
    ]
  },
  {
    type: 'bus',
    offers: [
      // 0 офферов
    ]
  },
  {
    type: 'train',
    offers: [
      { id: 7, title: 'Переход в первый класс', price: 90 },
      { id: 8, title: 'Горячее питание в пути', price: 25 },
      { id: 9, title: 'Выбор нижней полки', price: 12 },
      { id: 10, title: 'Постельное бельё', price: 10 },
      { id: 11, title: 'Чай и кофе', price: 5 }
    ]
  },
  {
    type: 'ship',
    offers: [
      { id: 12, title: 'Каюта с видом на море', price: 150 },
      { id: 13, title: 'Шведский стол на борту', price: 60 }
    ]
  },
  {
    type: 'drive',
    offers: [
      { id: 14, title: 'Полная страховка автомобиля', price: 80 },
      { id: 15, title: 'Навигатор в аренду', price: 20 },
      { id: 16, title: 'Детское кресло', price: 15 },
      { id: 17, title: 'Второй водитель', price: 35 }
    ]
  },
  {
    type: 'flight',
    offers: [
      { id: 18, title: 'Дополнительный багаж', price: 50 },
      { id: 19, title: 'Выбор места в салоне', price: 30 },
      { id: 20, title: 'Питание премиум‑класса', price: 45 },
      { id: 21, title: 'Приоритетная регистрация', price: 35 },
      { id: 22, title: 'Доступ в бизнес‑зал', price: 70 },
      { id: 23, title: 'Дополнительное место для ног', price: 40 }
    ]
  },
  {
    type: 'check-in',
    offers: [
      { id: 24, title: 'Ранний заезд', price: 40 }
    ]
  },
  {
    type: 'sightseeing',
    offers: [
      { id: 25, title: 'Личный гид', price: 100 },
      { id: 26, title: 'Аудиогид', price: 15 },
      { id: 27, title: 'Приоритетный вход без очереди', price: 35 }
    ]
  },
  {
    type: 'restaurant',
    offers: [
      { id: 28, title: 'Столик у окна', price: 20 },
      { id: 29, title: 'Дегустационное меню', price: 55 }
    ]
  }
];

export {events};
