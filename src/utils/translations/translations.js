export const translations = {
  en: {
    happenedToday: "Happened on today's date",
    births: 'Births',
    events: 'Events',
    holidays: 'Holidays',
    serbian: 'Serbian',
    english: 'English',
    date: (weekday, day, month, year) =>
      `(${weekday}, ${day}/${month}/${year})`,
  },
  bs: {
    happenedToday: 'Dogodilo se na današnji dan',
    births: 'Rođenja',
    events: 'Događaji',
    holidays: 'Praznici',
    serbian: 'Srpski',
    english: 'English',
    date: (weekday, day, month, year) =>
      `(${weekday}, ${day}.${month}.${year})`,
  },
};

export const bsWeekdays = {
  Monday: 'Ponedjeljak',
  Tuesday: 'Utorak',
  Wednesday: 'Srijeda',
  Thursday: 'Četvrtak',
  Friday: 'Petak',
  Saturday: 'Subota',
  Sunday: 'Nedjelja',
};
