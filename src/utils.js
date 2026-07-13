const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;

const isEsc = (evt) => evt.key === 'Escape';

function getDuration(start, end) {
  const totalMinutes = end.diff(start, 'minute');
  const formatTwoDigits = (number) => String(number).padStart(2, '0');

  // Меньше часа → только минуты
  if (totalMinutes < MINUTES_IN_HOUR) {
    return `${totalMinutes}M`;
  }

  // Меньше суток → часы и минуты
  if (totalMinutes < HOURS_IN_DAY * MINUTES_IN_HOUR) {
    const hoursShort = Math.floor(totalMinutes / MINUTES_IN_HOUR);
    const minutesShort = totalMinutes % MINUTES_IN_HOUR;
    return `${formatTwoDigits(hoursShort)}H ${formatTwoDigits(minutesShort)}M`;
  }

  // Больше суток → дни, часы, минуты
  const daysLong = Math.floor(totalMinutes / (HOURS_IN_DAY * MINUTES_IN_HOUR));
  const hoursLong = Math.floor((totalMinutes % (HOURS_IN_DAY * MINUTES_IN_HOUR)) / MINUTES_IN_HOUR);
  const minutesLong = totalMinutes % MINUTES_IN_HOUR;

  return `${formatTwoDigits(daysLong)}D ${formatTwoDigits(hoursLong)}H ${formatTwoDigits(minutesLong)}M`;
}

export { isEsc, getDuration };
