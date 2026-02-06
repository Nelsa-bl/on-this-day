export const translations = {
  en: {
    happenedToday: "Happened on today's date",
    births: 'Births',
    events: 'Events',
    holidays: 'Holidays',
    backToList: 'Back to list',
    serbian: 'Serbian',
    english: 'English',
    date: (weekday, day, month, year) =>
      `(${weekday}, ${day}/${month}/${year})`,
  },
  bs: {
    happenedToday: 'Dogodilo se na danaÅ¡nji dan',
    births: 'RoÄ‘enja',
    events: 'DogaÄ‘aji',
    holidays: 'Praznici',
    backToList: 'Nazad na listu',
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
  Thursday: 'ÄŒetvrtak',
  Friday: 'Petak',
  Saturday: 'Subota',
  Sunday: 'Nedjelja',
};
