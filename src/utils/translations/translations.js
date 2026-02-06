export const translations = {
  en: {
    happenedToday: "Happened on today's date",
    births: 'Births',
    events: 'Events',
    holidays: 'Holidays',
    backToList: 'Back to list',
    readFullArticle: 'Read full article',
    related: 'Related',
    noRelations: 'No related articles',
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
    backToList: 'Nazad na listu',
    serbian: 'Srpski',
    english: 'English',
    readFullArticle: 'Pročitaj cijeli članaka',
    related: 'Povezano',
    noRelations: 'Nema povezanih članaka',
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
