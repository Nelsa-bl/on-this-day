// Import components
import List from './components/list/list.component';
import { year, month, day, weekday } from './utils/date/date';
import BackToTopButton from './components/backToTopButton/backToTopButton';
import Header from './components/header/header';
import Spinner from './components/spinner/spinner.component';
import useSessionStorage from './utils/hooks/useSessionStorage';
import useLocalStorage from './utils/hooks/useLocalStorage';
import { Routes, Route } from 'react-router-dom';
import { lazy, startTransition, Suspense, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { getData, getFeaturedData } from './utils/apis/api';
import { enrichEventsWithWikidataCategory } from './utils/events/wikidataCategory';
import {
  requestNotificationPermission,
  startDailyReminder,
} from './utils/notifications/dailyReminder';

const EventDetails = lazy(() =>
  import('./pages/eventDetails/eventDetails.component'),
);

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
  const [isDarkTheme, setIsDarkTheme] = useLocalStorage('isDarkTheme', false);

  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true;
    const loadData = async () => {
      try {
        setIsLoading(true);
        setHasFetched(false);
        setError('');
        setFeaturedData(null);
        const data = await getData(language, controller.signal);
        if (!isCurrent) return;
        setEvents(data);

        // Run category enrichment in background so first paint is not blocked.
        if (process.env.NODE_ENV !== 'test') {
          enrichEventsWithWikidataCategory({
            data,
            language,
            signal: controller.signal,
          })
            .then((enrichedData) => {
              if (!isCurrent || controller.signal.aborted || !enrichedData) return;
              setEvents({ ...enrichedData });
            })
            .catch(() => {});
        }
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
    let isCurrent = true;
    const controller = new AbortController();
    let idleId;
    let timeoutId;

    const loadFeatured = async () => {
      try {
        const featured = await getFeaturedData(language, controller.signal).catch(
          () => null,
        );
        if (!isCurrent || controller.signal.aborted) return;
        startTransition(() => {
          setFeaturedData(featured);
        });
      } catch {}
    };

    const scheduleLoad = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(loadFeatured, { timeout: 1500 });
        return;
      }

      timeoutId = window.setTimeout(loadFeatured, 350);
    };

    scheduleLoad();

    return () => {
      isCurrent = false;
      controller.abort();
      if (idleId) window.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [language, reloadKey]);

  useEffect(() => {
    if (!dailyReminderEnabled) return () => {};
    return startDailyReminder(language);
  }, [dailyReminderEnabled, language]);

  useEffect(() => {
    const theme = isDarkTheme ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    document.documentElement.classList.remove('theme-preload');

    return () => {
      delete document.documentElement.dataset.theme;
      delete document.body.dataset.theme;
    };
  }, [isDarkTheme]);

  const handleReminderToggle = async () => {
    if (dailyReminderEnabled) {
      setDailyReminderEnabled(false);
      return;
    }

    const granted = await requestNotificationPermission();
    if (granted) setDailyReminderEnabled(true);
  };

  const handleThemeToggle = () => {
    const nextTheme = !isDarkTheme;
    const root = document.documentElement;
    root.style.setProperty('--theme-switch-origin-x', 'calc(100% - 60px)');
    root.style.setProperty('--theme-switch-origin-y', '72px');

    if (!document.startViewTransition) {
      setIsDarkTheme(nextTheme);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => {
        setIsDarkTheme(nextTheme);
      });
    });
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
        isDarkTheme={isDarkTheme}
        onThemeToggle={handleThemeToggle}
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
            <Suspense fallback={<Spinner />}>
              <EventDetails
                language={language}
                events={events}
                isLoading={isLoading}
                appError={error}
              />
            </Suspense>
          }
        />
      </Routes>
      <BackToTopButton />
    </div>
  );
};

export default App;
