import './header.style.scss';

const Header = ({ language, setLanguage, weekday, day, month, year }) => {
  const weekDayFirstUpperCase =
    weekday.charAt(0).toUpperCase() + weekday.slice(1);

  return (
    <div className='app-header'>
      <div className='language-switcher'>
        <button onClick={() => setLanguage('bs')} disabled={language === 'bs'}>
          Serbian
        </button>
        <button onClick={() => setLanguage('en')} disabled={language === 'en'}>
          English
        </button>
      </div>
      <h2>Happened on today`s date</h2>
      <p style={{ marginTop: '-10px' }}>
        ({weekDayFirstUpperCase}, {day}/{month}/{year})
      </p>
    </div>
  );
};

export default Header;
