import './header.style.scss';
import {
  translations,
  bsWeekdays,
} from '../../utils/translations/translations';

const Header = ({ language, setLanguage, weekday, day, month, year }) => {
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
      </div>
      <h2>{t.happenedToday}</h2>
      <p style={{ marginTop: '-10px' }}>
        {t.date(weekDayFirstUpperCase, day, month, year)}
      </p>
    </div>
  );
};

export default Header;
