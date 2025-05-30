// Import components
import List from './components/list/list.component';
import { year, month, day, weekday } from './utils/date/date';
import BackToTopButton from './components/backToTopButton/backToTopButton';
import Header from './components/header/header';
import useSessionStorage from './utils/hooks/useSessionStorage';

const App = () => {
  const [language, setLanguage] = useSessionStorage('language', 'bs'); // Use session storage

  return (
    <div className='App'>
      <Header
        language={language}
        setLanguage={setLanguage}
        weekday={weekday}
        day={day}
        month={month}
        year={year}
      />
      <List language={language} />
      <BackToTopButton />
    </div>
  );
};

export default App;
