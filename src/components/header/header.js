import './header.style.scss';
import {
  translations,
  bsWeekdays,
} from '../../utils/translations/translations';

const Header = ({
  language,
  setLanguage,
  weekday,
  day,
  month,
  year,
  dailyReminderEnabled,
  onReminderToggle,
  isDarkTheme,
  onThemeToggle,
}) => {
  let weekDayFirstUpperCase =
    weekday.charAt(0).toUpperCase() + weekday.slice(1);

  if (language === 'bs') {
    weekDayFirstUpperCase =
      bsWeekdays[weekDayFirstUpperCase] || weekDayFirstUpperCase;
  }

  const t = translations[language] || translations.bs;

  return (
    <div className='app-header'>
      <div className='language-switcher'>
        <button onClick={() => setLanguage('bs')} disabled={language === 'bs'}>
          {t.serbian}
        </button>
        <button onClick={() => setLanguage('en')} disabled={language === 'en'}>
          {t.english}
        </button>
        <button
          className={`reminder-icon-btn ${dailyReminderEnabled ? 'active' : ''}`}
          onClick={onReminderToggle}
          aria-label={dailyReminderEnabled ? t.reminderOn : t.reminderOff}
          title={dailyReminderEnabled ? t.reminderOn : t.reminderOff}
        >
          <svg viewBox='0 0 24 24' aria-hidden='true'>
            <path d='M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22ZM19 17h-1V11a6 6 0 1 0-12 0v6H5a1 1 0 0 0 0 2h14a1 1 0 1 0 0-2Zm-3 0H8v-6a4 4 0 0 1 8 0v6Z' />
          </svg>
        </button>
        <button
          className={`theme-icon-btn ${isDarkTheme ? 'active' : ''}`}
          onClick={onThemeToggle}
          aria-label={isDarkTheme ? t.darkThemeOn : t.darkThemeOff}
          title={isDarkTheme ? t.darkThemeOn : t.darkThemeOff}
        >
          <svg viewBox='0 0 24 24' aria-hidden='true'>
            <path d='M21 14.25A8.25 8.25 0 0 1 9.75 3a.75.75 0 0 0-.96-.96A9.75 9.75 0 1 0 21.96 15.2a.75.75 0 0 0-.96-.95Z' />
          </svg>
        </button>
      </div>
      <h2>{t.happenedToday}</h2>
      <p style={{ marginTop: '-10px' }}>
        {t.date(weekDayFirstUpperCase, day, month, year)}
      </p>
    </div>
  );
};

export default Header;
