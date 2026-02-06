// Import components
import List from './components/list/list.component';
import EventDetails from './pages/eventDetails/eventDetails.component';
import { year, month, day, weekday } from './utils/date/date';
import BackToTopButton from './components/backToTopButton/backToTopButton';
import Header from './components/header/header';
import useSessionStorage from './utils/hooks/useSessionStorage';
import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getData } from './utils/apis/api';

const App = () => {
  const [language, setLanguage] = useSessionStorage('language', 'bs'); // Use session storage
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getData(language);
        if (isMounted) setEvents(data);
      } catch (err) {
        console.error(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [language]);

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
      <Routes>
        <Route
          path='/'
          element={<List language={language} events={events} isLoading={isLoading} />}
        />
        <Route
          path='/event/:type/:pageId'
          element={
            <EventDetails
              language={language}
              events={events}
              isLoading={isLoading}
            />
          }
        />
      </Routes>
      <BackToTopButton />
    </div>
  );
};

export default App;
