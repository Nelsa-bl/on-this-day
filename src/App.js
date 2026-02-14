// Import components
import List from './components/list/list.component';
import EventDetails from './pages/eventDetails/eventDetails.component';
import { year, month, day, weekday } from './utils/date/date';
import BackToTopButton from './components/backToTopButton/backToTopButton';
import Header from './components/header/header';
import useSessionStorage from './utils/hooks/useSessionStorage';
import useLocalStorage from './utils/hooks/useLocalStorage';
import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getData, getFeaturedData } from './utils/apis/api';
import {
  requestNotificationPermission,
  startDailyReminder,
} from './utils/notifications/dailyReminder';

const App = () => {
  const [language, setLanguage] = useSessionStorage('language', 'bs'); // Use session storage
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState('');
  const [featuredData, setFeaturedData] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useLocalStorage(
    'dailyReminderEnabled',
    false
  );

  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true;
    const loadData = async () => {
      try {
        setIsLoading(true);
        setHasFetched(false);
        setError('');
        const [data, featured] = await Promise.all([
          getData(language, controller.signal),
          getFeaturedData(language, controller.signal).catch(() => null),
        ]);
        if (!isCurrent) return;
        setEvents(data);
        setFeaturedData(featured);
      } catch (err) {
        if (!isCurrent || err?.name === 'AbortError') return;
        setError(err?.message || 'Unable to load events.');
      } finally {
        if (!isCurrent) return;
        setHasFetched(true);
        setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [language, reloadKey]);

  useEffect(() => {
    if (!dailyReminderEnabled) return () => {};
    return startDailyReminder(language);
  }, [dailyReminderEnabled, language]);

  const handleReminderToggle = async () => {
    if (dailyReminderEnabled) {
      setDailyReminderEnabled(false);
      return;
    }

    const granted = await requestNotificationPermission();
    if (granted) setDailyReminderEnabled(true);
  };

  return (
    <div className='App'>
      <Header
        language={language}
        setLanguage={setLanguage}
        weekday={weekday}
        day={day}
        month={month}
        year={year}
        dailyReminderEnabled={dailyReminderEnabled}
        onReminderToggle={handleReminderToggle}
      />
      <Routes>
        <Route
          path='/'
          element={
            <List
              language={language}
              events={events}
              isLoading={isLoading}
              hasFetched={hasFetched}
              error={error}
              featuredData={featuredData}
              onRetry={() => setReloadKey((prev) => prev + 1)}
            />
          }
        />
        <Route
          path='/event/:type/:pageId'
          element={
            <EventDetails
              language={language}
              events={events}
              isLoading={isLoading}
              appError={error}
            />
          }
        />
      </Routes>
      <BackToTopButton />
    </div>
  );
};

export default App;
